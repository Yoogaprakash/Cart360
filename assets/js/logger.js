import { db, auth } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export async function logAction(actionName, tableName, recordSysId, details = {}) {
    if (!auth.currentUser) return;

    try {
        // We need company_sys_id. We can try to get it from details or fetch it, 
        // but for efficiency let's assume it's passed or we log under a global node if super admin.
        // For now, let's log under a global ACTION_LOGS node, partitioned by Company if possible.

        const logData = {
            ACTION_NAME: actionName,
            TABLE_NAME: tableName,
            RECORD_SYS_ID: recordSysId,
            USER_SYS_ID: auth.currentUser.uid,
            TIMESTAMP: new Date().toISOString(),
            DETAILS: details
        };

        const companyId = details.COMPANY_SYS_ID || 'GLOBAL';

        const logRef = push(ref(db, `ACTION_LOGS/${companyId}`));
        logData.SYS_ID = logRef.key;

        await set(logRef, logData);
        console.log("Action Logged:", actionName);

    } catch (error) {
        console.error("Logging failed:", error);
    }
}
