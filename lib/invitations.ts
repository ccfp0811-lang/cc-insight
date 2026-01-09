
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

export interface Invitation {
    id: string; // The invitation code itself
    code: string; // Same as id
    createdBy: string; // Admin UID
    createdAt: Timestamp;
    isUsed: boolean;
    usedBy?: string; // User UID
    usedAt?: Timestamp;
    memo?: string; // Optional filtering tag (e.g. "fukugyou recruitment")
}

/**
 * Generate a random alphanumeric code
 */
function generateCode(length: number = 8): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude ambiguous chars (I, 1, O, 0)
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Create a new invitation code
 */
export async function createInvitation(adminUid: string, memo: string = ""): Promise<Invitation> {
    const code = generateCode();

    // Ensure uniqueness (though collision is unlikely with 8 chars)
    const docRef = doc(db, "invitations", code);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
        return createInvitation(adminUid, memo); // Retry
    }

    const invitation: Omit<Invitation, "createdAt"> & { createdAt: any } = {
        id: code,
        code,
        createdBy: adminUid,
        createdAt: serverTimestamp(),
        isUsed: false,
        memo
    };

    await setDoc(docRef, invitation);

    return {
        ...invitation,
        createdAt: Timestamp.now() // Approximation for immediate UI update
    } as Invitation;
}

/**
 * Get all invitations (ordered by creation date desc)
 */
export async function getAllInvitations(): Promise<Invitation[]> {
    const q = query(
        collection(db, "invitations"),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const invitations: Invitation[] = [];

    snapshot.forEach((doc) => {
        invitations.push(doc.data() as Invitation);
    });

    return invitations;
}

/**
 * Validate an invitation code
 * Returns true if valid and unused
 */
export async function validateInvitation(code: string): Promise<boolean> {
    if (!code) return false;

    const docRef = doc(db, "invitations", code);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return false;

    const data = snapshot.data() as Invitation;
    return !data.isUsed;
}

/**
 * Mark invitation as used
 */
export async function markInvitationAsUsed(code: string, userUid: string): Promise<void> {
    const docRef = doc(db, "invitations", code);

    await updateDoc(docRef, {
        isUsed: true,
        usedBy: userUid,
        usedAt: serverTimestamp()
    });
}
