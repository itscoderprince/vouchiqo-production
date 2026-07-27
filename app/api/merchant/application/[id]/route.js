import mongoose from "mongoose";
import { NextResponse } from "next/server";
import MerchantApplication from "@/modules/merchant/merchant-application.model";
import Merchant from "@/modules/merchant/merchant.model";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (MONGODB_URI) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    let appData = null;
    if (mongoose.connection.readyState >= 1) {
      appData = await MerchantApplication.findOne({
        $or: [
          { applicationId: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        ],
      }).lean();
    }

    if (!appData) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: appData });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, actionNote, rejectionReason, documentUpdate } = body;

    await connectDB();

    let application = null;
    if (mongoose.connection.readyState >= 1) {
      application = await MerchantApplication.findOne({
        $or: [
          { applicationId: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        ],
      });
    }

    // Map percentage to status
    let progressPercentage = 33;
    let newTimelineEvent = null;

    if (status === "under_review") {
      progressPercentage = 66;
      newTimelineEvent = {
        title: "Under Review by Admin",
        detail:
          actionNote ||
          "Compliance team started verification of business documents.",
        type: "warning",
      };
    } else if (status === "document_verified") {
      progressPercentage = 85;
      newTimelineEvent = {
        title: "All Documents Verified Successfully",
        detail:
          actionNote ||
          "GSTIN, PAN, and Trade License verified by Vouchiqo Team.",
        type: "success",
      };
    } else if (status === "approved") {
      progressPercentage = 100;
      newTimelineEvent = {
        title: "Application Approved & Verified",
        detail:
          actionNote ||
          "Congratulations! Account is ready. Activation window: within 2 hours.",
        type: "success",
      };
    } else if (status === "rejected") {
      progressPercentage = 100;
      newTimelineEvent = {
        title: "Application Needs Attention / Rejected",
        detail:
          rejectionReason || "Document mismatch or incomplete information.",
        type: "error",
      };
    }

    if (application) {
      application.status = status || application.status;
      application.progressPercentage = progressPercentage;
      if (rejectionReason) application.rejectionReason = rejectionReason;
      application.lastUpdatedAt = new Date();

      if (newTimelineEvent) {
        application.timeline.unshift({
          ...newTimelineEvent,
          timestamp: new Date(),
        });
      }

      if (documentUpdate) {
        const doc = application.documents.find(
          (d) => d.name === documentUpdate.name,
        );
        if (doc) {
          doc.status = documentUpdate.status;
          doc.verifiedAt = new Date();
        }
      }

      await application.save();
    }

    // Sync status update to Merchant model in DB
    if (status) {
      const merchantStatus = status === "document_verified" ? "pending" : status;
      await Merchant.updateMany(
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
            ...(application?.email ? [{ contactEmail: application.email.toLowerCase().trim() }] : []),
          ],
        },
        {
          $set: {
            status: merchantStatus,
            isVerified: merchantStatus === "approved",
            ...(rejectionReason ? { rejectionReason } : {}),
          },
        }
      ).catch(() => {});
    }

    if (application) {
      return NextResponse.json({ success: true, data: application });
    }

    // Fallback response if using in-memory demo
    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      updatedStatus: status,
      progressPercentage,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
