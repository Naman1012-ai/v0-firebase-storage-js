import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCzQbkW-7lEE26PicC_VxaDc3VCwGdGUdI",
  authDomain: "biolynx-54d12.firebaseapp.com",
  databaseURL: "https://biolynx-54d12-default-rtdb.firebaseio.com",
  projectId: "biolynx-54d12",
  storageBucket: "biolynx-54d12.firebasestorage.app",
  messagingSenderId: "828008568380",
  appId: "1:828008568380:web:e9a",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── Response helper ───────────────────────────────────────────

function success(data) {
  return { success: true, data, error: null };
}

function failure(error) {
  return { success: false, data: null, error: error.message || error };
}

// ─── DONOR FUNCTIONS ───────────────────────────────────────────

export async function registerDonor(donorData) {
  try {
    const donorRef = push(ref(db, "donors"));
    const donor = {
      name: donorData.name,
      email: donorData.email,
      phone: donorData.phone,
      bloodGroup: donorData.bloodGroup,
      city: donorData.city,
      available: true,
      createdAt: new Date().toISOString(),
    };
    await set(donorRef, donor);
    return success({ id: donorRef.key, ...donor });
  } catch (error) {
    return failure(error);
  }
}

export async function updateDonorProfile(donorId, updatedData) {
  try {
    const donorRef = ref(db, `donors/${donorId}`);
    await update(donorRef, updatedData);
    return success({ id: donorId, ...updatedData });
  } catch (error) {
    return failure(error);
  }
}

export async function setDonorAvailability(donorId, status) {
  try {
    const donorRef = ref(db, `donors/${donorId}`);
    await update(donorRef, { available: status });
    return success({ id: donorId, available: status });
  } catch (error) {
    return failure(error);
  }
}

export async function getDonor(donorId) {
  try {
    const snapshot = await get(ref(db, `donors/${donorId}`));
    if (!snapshot.exists()) {
      return failure("Donor not found");
    }
    return success({ id: donorId, ...snapshot.val() });
  } catch (error) {
    return failure(error);
  }
}

// ─── HOSPITAL FUNCTIONS ────────────────────────────────────────

export async function registerHospital(hospitalData) {
  try {
    const hospitalRef = push(ref(db, "hospitals"));
    const hospital = {
      name: hospitalData.name,
      email: hospitalData.email,
      phone: hospitalData.phone,
      address: hospitalData.address,
      city: hospitalData.city,
      createdAt: new Date().toISOString(),
    };
    await set(hospitalRef, hospital);
    return success({ id: hospitalRef.key, ...hospital });
  } catch (error) {
    return failure(error);
  }
}

export async function getHospital(hospitalId) {
  try {
    const snapshot = await get(ref(db, `hospitals/${hospitalId}`));
    if (!snapshot.exists()) {
      return failure("Hospital not found");
    }
    return success({ id: hospitalId, ...snapshot.val() });
  } catch (error) {
    return failure(error);
  }
}

// ─── BLOOD REQUEST FUNCTIONS ───────────────────────────────────

export async function createRequest(hospitalId, requestData) {
  try {
    const requestRef = push(ref(db, "requests"));
    const requestId = requestRef.key;

    const request = {
      hospitalId,
      patientName: requestData.patientName,
      bloodGroup: requestData.bloodGroup,
      unitsNeeded: requestData.unitsNeeded,
      urgency: requestData.urgency,
      status: "pending",
      acceptedBy: null,
      createdAt: new Date().toISOString(),
    };

    // Atomic update: save request + hospital reference in one operation
    const updates = {};
    updates[`requests/${requestId}`] = request;
    updates[`hospitals/${hospitalId}/requests/${requestId}`] = true;

    await update(ref(db), updates);

    return success({ id: requestId, ...request });
  } catch (error) {
    return failure(error);
  }
}

export async function acceptRequest(requestId, donorId) {
  try {
    // Atomic update: update request status + add donor reference
    const updates = {};
    updates[`requests/${requestId}/status`] = "accepted";
    updates[`requests/${requestId}/acceptedBy`] = donorId;
    updates[`donors/${donorId}/acceptedRequests/${requestId}`] = true;

    await update(ref(db), updates);

    return success({ requestId, donorId, status: "accepted" });
  } catch (error) {
    return failure(error);
  }
}

export async function getAllRequests() {
  try {
    const snapshot = await get(ref(db, "requests"));
    if (!snapshot.exists()) {
      return success([]);
    }
    const requests = [];
    snapshot.forEach((child) => {
      requests.push({ id: child.key, ...child.val() });
    });
    return success(requests);
  } catch (error) {
    return failure(error);
  }
}

export async function getRequestsByHospital(hospitalId) {
  try {
    const q = query(
      ref(db, "requests"),
      orderByChild("hospitalId"),
      equalTo(hospitalId)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) {
      return success([]);
    }
    const requests = [];
    snapshot.forEach((child) => {
      requests.push({ id: child.key, ...child.val() });
    });
    return success(requests);
  } catch (error) {
    return failure(error);
  }
}

export async function getRequestsForDonor(donorBloodGroup) {
  try {
    const q = query(
      ref(db, "requests"),
      orderByChild("bloodGroup"),
      equalTo(donorBloodGroup)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) {
      return success([]);
    }
    const requests = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.status === "pending") {
        requests.push({ id: child.key, ...data });
      }
    });
    return success(requests);
  } catch (error) {
    return failure(error);
  }
}

// ─── CROSS-SYNC: COMPLETE REQUEST ──────────────────────────────

export async function completeRequest(requestId) {
  try {
    const requestRef = ref(db, `requests/${requestId}`);
    await update(requestRef, { status: "completed" });
    return success({ requestId, status: "completed" });
  } catch (error) {
    return failure(error);
  }
}

// ─── CROSS-SYNC: DELETE REQUEST ────────────────────────────────

export async function deleteRequest(requestId) {
  try {
    // Read the request first to find related references
    const snapshot = await get(ref(db, `requests/${requestId}`));
    if (!snapshot.exists()) {
      return failure("Request not found");
    }

    const request = snapshot.val();
    const updates = {};

    // Remove main request node
    updates[`requests/${requestId}`] = null;

    // Remove hospital reference
    if (request.hospitalId) {
      updates[`hospitals/${request.hospitalId}/requests/${requestId}`] = null;
    }

    // Remove donor reference if accepted
    if (request.acceptedBy) {
      updates[`donors/${request.acceptedBy}/acceptedRequests/${requestId}`] = null;
    }

    await update(ref(db), updates);

    return success({ requestId, deleted: true });
  } catch (error) {
    return failure(error);
  }
}
