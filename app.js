// =====================================
// ChurchHQ - Supabase Configuration
// =====================================

const SUPABASE_URL = 'https://mifqotacealqwnxkmcps.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_BInspfbbrTK3jpjWgkNjCA_ivFIix3p';

const churchSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let currentUser = null;
let currentUserRole = null;

console.log("✅ ChurchHQ Supabase client created.");
console.log(
    "Supabase .from():",
    typeof churchSupabase.from
);

async function testSupabaseConnection() {
    console.log("========== COJTGK SUPABASE TEST ==========");

    try {
        const { data, error } = await churchSupabase
            .from("members")
            .select("id")
            .limit(1);

        if (error) {
            console.error("❌ Supabase database test failed:", error);
            return false;
        }

        console.log("✅ SUPABASE CONNECTION SUCCESSFUL!");
        console.log("Members table response:", data);

        return true;

    } catch (error) {
        console.error("❌ Supabase connection error:", error);
        return false;
    }
}

// ChurchHQ Engine - Optimized & Fixed
// =====================================

// Initialize Lucide Icons
if (window.lucide) {
    lucide.createIcons();
}

// =====================================
// MEMBERS - SUPABASE READ
// =====================================

async function loadMembersFromSupabase() {
    try {

        // -------------------------------------
        // 1. Kunin muna ang existing local data
        // -------------------------------------
        let localMembers = [];

        try {
            const saved = localStorage.getItem("churchhq_members");

            if (saved) {
                localMembers = JSON.parse(saved);
            }
        } catch (e) {
            localMembers = [];
        }

        // -------------------------------------
        // 2. Kunin ang members mula Supabase
        // -------------------------------------
        const { data, error } = await churchSupabase
            .from("members")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(
                "❌ Failed to load members from Supabase:",
                error
            );
            return false;
        }

        const supabaseMembers = Array.isArray(data) ? data : [];

        // -------------------------------------
        // 3. Kung may old local members,
        //    ilipat sila sa Supabase
        // -------------------------------------
        if (localMembers.length > 0) {

            const existingIds = new Set(
                supabaseMembers.map(member => Number(member.id))
            );

            const membersToMigrate = localMembers.filter(member =>
                !existingIds.has(Number(member.id))
            );

            if (
    membersToMigrate.length > 0 &&
    isAdminUser()
) {
                const { data: migratedData, error: migrateError } =
                    await churchSupabase
                        .from("members")
                        .insert(
                            membersToMigrate.map(member => ({
                                id: Number(member.id),
                                name: member.name,
                                contact: member.contact || "",
                                status: member.status || "",
                                ministry: member.ministry || "",
                                role: member.role || "Member",
                                birthday: member.birthday || null
                            }))
                        )
                        .select();

                if (migrateError) {

    console.error(
        "❌ Failed to migrate old members:",
        migrateError
    );

    // Huwag ihinto ang normal member loading.
    // Migration lamang ang nabigo.
}

                console.log(
                    "✅ Old members migrated to Supabase:",
                    migratedData
                );

                supabaseMembers.push(
                    ...(migratedData || [])
                );
            }
        }

        // -------------------------------------
        // 4. Supabase na ang magiging source
        // -------------------------------------
        members = supabaseMembers;

        // -------------------------------------
        // 5. I-sync din ang localStorage
        // -------------------------------------
        saveMembersToLocalStorage();

        // -------------------------------------
        // 6. I-render ang existing UI
        // -------------------------------------
        loadSavedMembers();
        loadDashboardBirthdays();
        initializeServiceMemberAutocomplete();
        initializeBackingVocalsAutocomplete();
        console.log(
            "✅ Members loaded from Supabase:",
            members
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Members Supabase read error:",
            error
        );

        return false;
    }
}


function getSelectedMemberMinistries() {
    const container = document.getElementById("memberMinistry");

    if (!container) {
        return [];
    }

    return Array.from(
        container.querySelectorAll('input[type="checkbox"]:checked')
    )
        .map(checkbox => checkbox.value.trim())
        .filter(value => value !== "");
}

// =====================================
// MEMBERS - SUPABASE INSERT
// =====================================

async function saveMemberToSupabase(member) {

    try {

        const { data, error } = await churchSupabase
            .from("members")
            .insert([{
                id: member.id,
                name: member.name,
                contact: member.contact || '',
                status: member.status || '',
                ministry: member.ministry || '',
                ministries: member.ministries || [],
                role: member.role || 'Member',
                birthday: member.birthday || null
            }])
            .select();

        if (error) {
            console.error(
                "❌ Failed to save member:",
                error
            );
            return false;
        }

        console.log(
            "✅ Member saved to Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Supabase insert error:",
            error
        );

        return false;
    }
}

// =====================================
// MEMBERS - SUPABASE UPDATE
// =====================================

async function updateMemberToSupabase(member) {

    try {

        const { data, error } = await churchSupabase
            .from("members")
            .update({
                name: member.name,
                contact: member.contact || '',
                status: member.status || '',
                ministry: member.ministry || '',
                ministries: member.ministries || [],
                role: member.role || 'Member',
                birthday: member.birthday || null
            })
            .eq("id", member.id)
            .select();

        if (error) {
            console.error(
                "❌ Failed to update member:",
                error
            );
            return false;
        }

        console.log(
            "✅ Member updated in Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Supabase update error:",
            error
        );

        return false;
    }
}

// =====================================
// MEMBERS - SUPABASE DELETE
// =====================================

async function deleteMemberFromSupabase(memberId) {

    try {

        const { data, error } = await churchSupabase
            .from("members")
            .delete()
            .eq("id", memberId)
            .select();

        if (error) {
            console.error(
                "❌ Failed to delete member from Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Member deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Supabase delete error:",
            error
        );

        return false;
    }
}

async function saveSongToSupabase(song) {
    try {
        const { data, error } = await churchSupabase
            .from("songs")
            .insert([{
                id: song.id,
                title: song.title,
                artist: song.artist,
                key: song.key,
                category: song.category,
                lyrics: song.lyrics
            }])
            .select();

        if (error) {
            console.error(
                "❌ Failed to save song to Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Song saved to Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Song Supabase insert error:",
            error
        );
        return false;
    }
}

// =====================================
// SONGS - SUPABASE UPDATE
// =====================================

async function updateSongToSupabase(song) {
    try {
        const { data, error } = await churchSupabase
            .from("songs")
            .update({
                title: song.title,
                artist: song.artist,
                key: song.key,
                category: song.category,
                lyrics: song.lyrics
            })
            .eq("id", song.id)
            .select();

        if (error) {
            console.error(
                "❌ Failed to update song in Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Song updated in Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Song Supabase update error:",
            error
        );
        return false;
    }
}

// =====================================
// SONGS - SUPABASE DELETE
// =====================================

async function deleteSongFromSupabase(id) {
    try {
        const { data, error } = await churchSupabase
            .from("songs")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            console.error(
                "❌ Failed to delete song from Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Song deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Song Supabase delete error:",
            error
        );
        return false;
    }
}

// =====================================
// ACTIVITIES - SUPABASE READ
// =====================================

async function loadActivitiesFromSupabase() {
    try {
        const { data, error } = await churchSupabase
            .from("activities")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error(
                "❌ Failed to load activities from Supabase:",
                error
            );
            return false;
        }

        const activities = data || [];

        // Keep existing localStorage behavior
        localStorage.setItem(
            "churchhq_activities",
            JSON.stringify(activities)
        );

        // Keep existing dashboard/UI
        renderManageModalContent();
        renderDashboardLists();
        loadEventCountFromSupabase();

        console.log(
            "✅ Activities loaded from Supabase:",
            activities
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Activities Supabase read error:",
            error
        );
        return false;
    }
}

// =====================================
// ANNOUNCEMENTS - SUPABASE READ
// =====================================

async function loadAnnouncementsFromSupabase() {
    try {
        const { data, error } = await churchSupabase
            .from("announcements")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error(
                "❌ Failed to load announcements from Supabase:",
                error
            );
            return false;
        }

        const announcements = data || [];

        localStorage.setItem(
            "churchhq_announcements",
            JSON.stringify(announcements)
        );

        renderManageModalContent();
        renderDashboardLists();
        renderTopAttendance();

        console.log(
            "✅ Announcements loaded from Supabase:",
            announcements
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Announcements Supabase read error:",
            error
        );
        return false;
    }
}

async function saveActivityToSupabase(activity) {
    try {
        const { data, error } = await churchSupabase
            .from("activities")
            .insert([{
                id: activity.id,
                title: activity.title,
                date: activity.date
            }])
            .select();

        if (error) {
            console.error(
                "❌ Failed to save activity to Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Activity saved to Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Activity Supabase insert error:",
            error
        );
        return false;
    }
}

// =====================================
// ACTIVITIES - SUPABASE UPDATE
// =====================================

async function updateActivityToSupabase(activity) {
    try {
        const { data, error } = await churchSupabase
            .from("activities")
            .update({
                title: activity.title,
                date: activity.date
            })
            .eq("id", activity.id)
            .select();

        if (error) {
            console.error(
                "❌ Failed to update activity in Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Activity updated in Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Activity Supabase update error:",
            error
        );
        return false;
    }
}

// =====================================
// ACTIVITIES - SUPABASE DELETE
// =====================================

async function deleteActivityFromSupabase(id) {
    try {
        const { data, error } = await churchSupabase
            .from("activities")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            console.error(
                "❌ Failed to delete activity from Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Activity deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Activity Supabase delete error:",
            error
        );
        return false;
    }
}

async function deleteActivityItem(id) {
    if (!confirm("Sigurado ka bang buburahin ito?")) return;

    const deletedFromSupabase =
        await deleteActivityFromSupabase(id);

    if (!deletedFromSupabase) {
        alert("❌ Hindi nabura ang activity sa Supabase.");
        return;
    }

    let activities = [];
    try {
        activities =
            JSON.parse(
                localStorage.getItem("churchhq_activities")
            ) || [];
    } catch(e) {}

    activities = activities.filter(
        a => a.id !== id
    );

    localStorage.setItem(
        "churchhq_activities",
        JSON.stringify(activities)
    );

    renderManageModalContent();
    renderDashboardLists();
}

async function saveAnnouncementToSupabase(announcement) {
    try {
        const { data, error } = await churchSupabase
            .from("announcements")
            .insert([{
                id: announcement.id,
                text: announcement.text
            }])
            .select();

        if (error) {
            console.error(
                "❌ Failed to save announcement to Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Announcement saved to Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Announcement Supabase insert error:",
            error
        );
        return false;
    }
}

// =====================================
// ANNOUNCEMENTS - SUPABASE UPDATE
// =====================================

async function updateAnnouncementToSupabase(announcement) {
    try {
        const { data, error } = await churchSupabase
            .from("announcements")
            .update({
                text: announcement.text
            })
            .eq("id", announcement.id)
            .select();

        if (error) {
            console.error(
                "❌ Failed to update announcement in Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Announcement updated in Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Announcement Supabase update error:",
            error
        );
        return false;
    }
}

// =====================================
// ANNOUNCEMENTS - SUPABASE DELETE
// =====================================

async function deleteAnnouncementFromSupabase(id) {
    try {
        const { data, error } = await churchSupabase
            .from("announcements")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            console.error(
                "❌ Failed to delete announcement from Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Announcement deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Announcement Supabase delete error:",
            error
        );
        return false;
    }
}

// ---------- Navigation ----------
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    const activeNav = document.querySelector(`.nav-item[onclick*="${pageId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// ---------- Dark Mode ----------
const themeBtn = document.getElementById("themeBtn");

if (themeBtn) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeBtn.innerHTML = "☀️ Light Mode";
    }

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            themeBtn.innerHTML = "☀️ Light Mode";
        } else {
            localStorage.setItem("theme", "light");
            themeBtn.innerHTML = "🌙 Dark Mode";
        }
    });
}

/* =========================================
   SUNDAY & MIDWEEK SERVICE MULTI-RECORD ENGINE
========================================= */
let sundayServices = [];
let midweekServices = [];

async function saveServiceData(type) {

    if (!requireAdmin()) {
        return;
    }

    const prefix = type === "sunday" ? "sun_" : "mid_";

    const dateEl = document.getElementById(prefix + "serviceDate");
    const dateValue = dateEl ? dateEl.value.trim() : "";

    if (!dateValue) {
        alert("Select Service Date before saving!");
        return;
    }

    const getVal = (fieldName) => {
        const el = document.getElementById(prefix + fieldName);
        return el ? el.value.trim() : "";
    };

    const serviceRecord = {
        date: dateValue,
        worshipLeader: getVal("worshipLeader"),
        backingVocals: getVal("backingVocals"),
        keys: getVal("keys"),
        guitar: getVal("guitar"),
        bass: getVal("bass"),
        drums: getVal("drums"),
        pptOperator: getVal("pptOperator"),
        soundEngineer: getVal("soundEngineer"),
        liveStream: getVal("liveStream"),
        preacher: getVal("preacher"),
        messageTitle: getVal("messageTitle"),
        songsLineup: getVal("songsLineup")
    };

    let targetArray = type === "sunday" ? sundayServices : midweekServices;
    const existingIndex = targetArray.findIndex(item => item.date === dateValue);

if (existingIndex !== -1) {

const updatedInSupabase =
    await updateServiceToSupabase(
        type,
        serviceRecord
    );
    if (!updatedInSupabase) {

        alert(
            "❌ Service record was not updated in Supabase."
        );

        return;
    }

    targetArray[existingIndex] = serviceRecord;

} else {

    const savedToSupabase =
        await saveServiceToSupabase(
            type,
            serviceRecord
        );

    if (!savedToSupabase) {

        alert(
            "❌ Service record was not saved to Supabase."
        );

        return;
    }

    targetArray.push(serviceRecord);
}

    targetArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem(`churchhq_${type}_services`, JSON.stringify(targetArray));
    
    if (type === "sunday") {
        sundayServices = targetArray;
    } else {
        midweekServices = targetArray;
    }

    alert(`✅ ${type === "sunday" ? "Sunday" : "Midweek"} Service roster for the date (${dateValue}) has been successfully saved!`);
    renderServiceHistory(type);
    updateServiceDateDropdowns();
}

function loadServiceRecord(type, date) {

    if (!requireAdmin()) {
        return;
    }

    const targetArray =
        type === "sunday"
            ? sundayServices
            : midweekServices;

    const record = targetArray.find(item => item.date === date);
    
    if (!record) return;

    const prefix = type === "sunday" ? "sun_" : "mid_";

    const dateEl = document.getElementById(prefix + "serviceDate");
    if (dateEl) dateEl.value = record.date || "";

    const setVal = (fieldName, value) => {
        const el = document.getElementById(prefix + fieldName);
        if (el) el.value = value || "";
    };

    setVal("worshipLeader", record.worshipLeader);
    setVal("backingVocals", record.backingVocals);
    setVal("keys", record.keys);
    setVal("guitar", record.guitar);
    setVal("bass", record.bass);
    setVal("drums", record.drums);
    setVal("pptOperator", record.pptOperator);
    setVal("soundEngineer", record.soundEngineer);
    setVal("liveStream", record.liveStream);
    setVal("preacher", record.preacher);
    setVal("messageTitle", record.messageTitle);
    setVal("songsLineup", record.songsLineup);
}

function renderServiceHistory(type) {
    const listBody = document.getElementById(`${type}HistoryBody`);
    if (!listBody) return;

    const targetArray = type === "sunday" ? sundayServices : midweekServices;
    listBody.innerHTML = "";

    if (targetArray.length === 0) {
        listBody.innerHTML = `<tr><td colspan="4" style="padding:15px; text-align:center; color:#9ca3af;">No saved records found.</td></tr>`;
        return;
    }

    targetArray.forEach(record => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #f1f5f9";

        tr.innerHTML = `
            <td style="padding: 10px;"><b>${record.date}</b></td>
            <td style="padding: 10px;">${record.worshipLeader || '-'}</td>
            <td style="padding: 10px;">${record.preacher || '-'}</td>
            <td style="padding: 10px; display:flex; gap:8px;">
                <button
    type="button"
    class="secondary-btn"
    data-admin-only="true"
    style="padding: 3px 8px; font-size: 12px;"
    onclick="loadServiceRecord('${type}', '${record.date}')"
>
    ✏️ Load/Edit
</button>

<button
    type="button"
    class="secondary-btn"
    data-admin-only="true"
    style="padding: 3px 8px; font-size: 12px; color:#ef4444; border-color:#fca5a5;"
    onclick="deleteServiceRecord('${type}', '${record.date}')"
>
    ❌ Delete
</button>
            </td>
        `;
        listBody.appendChild(tr);
    });
}

// =====================================
// SUNDAY & MIDWEEK SERVICE - SUPABASE READ
// =====================================

async function loadServicesFromSupabase() {

    try {

        const { data, error } = await churchSupabase
            .from("service_records")
            .select("*")
            .order("date", { ascending: false });

        if (error) {

            console.error(
                "❌ Failed to load service records from Supabase:",
                error
            );

            return false;
        }

        const records = Array.isArray(data) ? data : [];

        // -------------------------------------
        // Convert Supabase fields to existing
        // JavaScript field names
        // -------------------------------------

        const mappedRecords = records.map(record => ({
            id: record.id,
            date: record.date || "",
            worshipLeader: record.worship_leader || "",
            backingVocals: record.backing_vocals || "",
            keys: record.keys || "",
            guitar: record.guitar || "",
            bass: record.bass || "",
            drums: record.drums || "",
            pptOperator: record.ppt_operator || "",
            soundEngineer: record.sound_engineer || "",
            liveStream: record.live_stream || "",
            preacher: record.preacher || "",
            messageTitle: record.message_title || "",
            songsLineup: record.songs_lineup || ""
        }));

        // -------------------------------------
        // Separate Sunday and Midweek records
        // -------------------------------------

        sundayServices = mappedRecords.filter(
            record => records.find(
                original => original.id === record.id
            )?.service_type === "sunday"
        );

        midweekServices = mappedRecords.filter(
            record => records.find(
                original => original.id === record.id
            )?.service_type === "midweek"
        );

        // -------------------------------------
        // Update existing UI
        // -------------------------------------

        renderServiceHistory("sunday");
        renderServiceHistory("midweek");
        updateServiceDateDropdowns();

        console.log(
            "✅ Sunday Services loaded from Supabase:",
            sundayServices
        );

        console.log(
            "✅ Midweek Services loaded from Supabase:",
            midweekServices
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Service Supabase read error:",
            error
        );

        return false;
    }
}

// =====================================
// SERVICE - SUPABASE INSERT
// =====================================

async function saveServiceToSupabase(type, serviceRecord) {

    try {

        const serviceId = Date.now();

        const { data, error } = await churchSupabase
            .from("service_records")
            .insert([{
                id: serviceId,
                service_type: type,
                date: serviceRecord.date,
                worship_leader: serviceRecord.worshipLeader || "",
                backing_vocals: serviceRecord.backingVocals || "",
                keys: serviceRecord.keys || "",
                guitar: serviceRecord.guitar || "",
                bass: serviceRecord.bass || "",
                drums: serviceRecord.drums || "",
                ppt_operator: serviceRecord.pptOperator || "",
                sound_engineer: serviceRecord.soundEngineer || "",
                live_stream: serviceRecord.liveStream || "",
                preacher: serviceRecord.preacher || "",
                message_title: serviceRecord.messageTitle || "",
                songs_lineup: serviceRecord.songsLineup || ""
            }])
            .select();

        if (error) {

            console.error(
                "❌ Failed to save service to Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Service saved to Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Service Supabase insert error:",
            error
        );

        return false;
    }
}

// =====================================
// SERVICE - SUPABASE UPDATE
// =====================================

async function updateServiceToSupabase(type, serviceRecord) {

    try {

        const { data, error } = await churchSupabase
            .from("service_records")
            .update({
                date: serviceRecord.date,
                worship_leader: serviceRecord.worshipLeader || "",
                backing_vocals: serviceRecord.backingVocals || "",
                keys: serviceRecord.keys || "",
                guitar: serviceRecord.guitar || "",
                bass: serviceRecord.bass || "",
                drums: serviceRecord.drums || "",
                ppt_operator: serviceRecord.pptOperator || "",
                sound_engineer: serviceRecord.soundEngineer || "",
                live_stream: serviceRecord.liveStream || "",
                preacher: serviceRecord.preacher || "",
                message_title: serviceRecord.messageTitle || "",
                songs_lineup: serviceRecord.songsLineup || ""
            })
            .eq("service_type", type)
            .eq("date", serviceRecord.date)
            .select();

        if (error) {

            console.error(
                "❌ Failed to update service in Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Service updated in Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Service Supabase update error:",
            error
        );

        return false;
    }
}

// =====================================
// SERVICE - SUPABASE DELETE
// =====================================

async function deleteServiceFromSupabase(type, date) {
    try {
        const { data, error } = await churchSupabase
            .from("service_records")
            .delete()
            .eq("service_type", type)
            .eq("date", date)
            .select();

        if (error) {
            console.error(
                "❌ Failed to delete service from Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Service deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Service Supabase delete error:",
            error
        );

        return false;
    }
}

function loadSavedServices() {
    try {
        sundayServices = JSON.parse(localStorage.getItem("churchhq_sunday_services")) || [];
        midweekServices = JSON.parse(localStorage.getItem("churchhq_midweek_services")) || [];
    } catch (e) {
        sundayServices = [];
        midweekServices = [];
    }
    renderServiceHistory("sunday");
    renderServiceHistory("midweek");
    updateServiceDateDropdowns();
}

async function deleteServiceRecord(type, date) {

    if (!requireAdmin()) {
        return;
    }

    if (!confirm(`Are you sure you want to delete the record for ${date}?`)) {
        return;
    }

    const deletedFromSupabase =
        await deleteServiceFromSupabase(type, date);

    if (!deletedFromSupabase) {

        alert(
            "❌ Failed to delete the record in Supabase.."
        );

        return;
    }

    if (type === "sunday") {

        sundayServices =
            sundayServices.filter(r => r.date !== date);

        localStorage.setItem(
            "churchhq_sunday_services",
            JSON.stringify(sundayServices)
        );

    } else {

        midweekServices =
            midweekServices.filter(r => r.date !== date);

        localStorage.setItem(
            "churchhq_midweek_services",
            JSON.stringify(midweekServices)
        );
    }

    renderServiceHistory(type);
    updateServiceDateDropdowns();

    alert(
        `✅ ${type === "sunday" ? "Sunday" : "Midweek"} Service on ${date} was successfully deleted.`
    );
}

function resetServiceForm(type) {
    const prefix = type === "sunday" ? "sun_" : "mid_";
    const dateEl = document.getElementById(prefix + "serviceDate");
    if (dateEl) dateEl.value = "";

    const fields = ["worshipLeader", "backingVocals", "keys", "guitar", "bass", "drums", "pptOperator", "soundEngineer", "liveStream", "preacher", "messageTitle", "songsLineup"];
    fields.forEach(field => {
        const el = document.getElementById(prefix + field);
        if (el) el.value = "";
    });
}

/* =========================================
   NEW: GENERATOR DROPDOWN & AUTO-POPULATE FUNCTIONS
========================================= */
function updateServiceDateDropdowns() {
    const sunSelect = document.getElementById('sunGenDateSelect');
    if (sunSelect) {
        sunSelect.innerHTML = '<option value="">-- Pumili ng Petsa ng Sunday Serbisyo --</option>';
        sundayServices.forEach((item, index) => {
            let opt = document.createElement('option');
            opt.value = index;
            opt.textContent = item.date ? `Sunday Service - ${item.date}` : `Service ${index + 1}`;
            sunSelect.appendChild(opt);
        });
    }

    const midSelect = document.getElementById('midGenDateSelect');
    if (midSelect) {
        midSelect.innerHTML = '<option value="">-- Pumili ng Petsa ng Midweek Serbisyo --</option>';
        midweekServices.forEach((item, index) => {
            let opt = document.createElement('option');
            opt.value = index;
            opt.textContent = item.date ? `Midweek Service - ${item.date}` : `Service ${index + 1}`;
            midSelect.appendChild(opt);
        });
    }
}

function populateSundayGeneratorFields() {
    const sunSelect = document.getElementById('sunGenDateSelect');
    if (!sunSelect || sunSelect.value === "") return;

    const index = Number(sunSelect.value);
    const selectedRecord = sundayServices[index];

    if (selectedRecord) {
        const preacherEl = document.getElementById('sunGenPreacher');
        const titleEl = document.getElementById('sunGenMessageTitle');
        
        if (preacherEl) preacherEl.value = selectedRecord.preacher || '';
        if (titleEl) titleEl.value = selectedRecord.messageTitle || '';
        
        if (typeof generateCOJTGKStreamDetailsFromSaved === 'function') {
            generateCOJTGKStreamDetailsFromSaved();
        }
    }
}

function populateMidweekGeneratorFields() {
    const midSelect = document.getElementById('midGenDateSelect');
    if (!midSelect || midSelect.value === "") return;

    const index = Number(midSelect.value);
    const selectedRecord = midweekServices[index];

    if (selectedRecord) {
        const preacherEl = document.getElementById('midGenPreacher');
        const titleEl = document.getElementById('midGenMessageTitle');
        
        if (preacherEl) preacherEl.value = selectedRecord.preacher || '';
        if (titleEl) titleEl.value = selectedRecord.messageTitle || '';
        
        if (typeof generateCOJTGKMidweekStreamDetailsFromSaved === 'function') {
            generateCOJTGKMidweekStreamDetailsFromSaved();
        }
    }
}


// =====================================
// DASHBOARD - EVENTS COUNT FROM SUPABASE
// =====================================

async function loadEventCountFromSupabase() {
    try {
        const { data, error } = await churchSupabase
            .from("activities")
            .select("id, date");

        if (error) {
            console.error(
                "❌ Failed to load event count from Supabase:",
                error
            );
            return;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const eventsThisMonth = (data || []).filter(activity => {
            if (!activity.date) return false;

            const activityDate = new Date(activity.date);

            if (isNaN(activityDate.getTime())) {
                return false;
            }

            return (
                activityDate.getMonth() === currentMonth &&
                activityDate.getFullYear() === currentYear
            );
        });

        const eventCountEl =
            document.getElementById("eventCount");

        if (eventCountEl) {
            eventCountEl.textContent =
                eventsThisMonth.length;
        }

        console.log(
            "✅ Events count loaded from Supabase:",
            eventsThisMonth.length
        );

    } catch (error) {
        console.error(
            "❌ Event count Supabase error:",
            error
        );
    }
}


/* =========================================
   PLANNER MODAL & ENGINE
========================================= */
const taskModal = document.getElementById("taskModal");
const addTaskBtn = document.getElementById("addTaskBtn");
const closeModal = document.getElementById("closeModal");
const cancelTask = document.getElementById("cancelTask");

function openTaskModal() { if (taskModal) taskModal.classList.remove("hidden"); }
function closeTaskModal() { 
    if (taskModal) taskModal.classList.add("hidden"); 
    editingTaskId = null;
}

if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
        clearForm();
        openTaskModal();
    });
}
if (closeModal) closeModal.addEventListener("click", closeTaskModal);
if (cancelTask) cancelTask.addEventListener("click", closeTaskModal);

let tasks = [];
let editingTaskId = null;

const saveTaskBtn = document.getElementById("saveTask");
if (saveTaskBtn) saveTaskBtn.addEventListener("click", saveTask);


document.addEventListener(
"DOMContentLoaded",
()=>{

    checkLoginSession();
      updateLastBackupDisplay();
});

    const attendanceYearSelect =
        document.getElementById(
            "attendanceYearSelect"
        );

    if (attendanceYearSelect) {

        attendanceYearSelect.addEventListener(
            "change",
            function () {

                selectedAttendanceYear =
                    Number(this.value);

                console.log(
                    "Changed Year:",
                    selectedAttendanceYear
                );

                renderAttendanceSummary();
                renderTopAttendance();

            }
        );

    }


async function saveTask() {

    if (!requireAdmin()) {
        return;
    }

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const category = document.getElementById("taskCategory").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDate").value;
    const status = document.getElementById("taskStatus").value;

    if (title === "") {
        alert("Please enter task title.");
        return;
    }

    // =====================================
    // EDIT EXISTING TASK
    // =====================================

    if (editingTaskId !== null) {

    const index = tasks.findIndex(
        task => task.id === editingTaskId
    );

    if (index !== -1) {

        const updatedTask = {
            id: editingTaskId,
            title,
            description,
            category,
            priority,
            dueDate,
            status
        };

        const updatedInSupabase =
            await updateTaskToSupabase(updatedTask);

        if (!updatedInSupabase) {

            alert(
                "❌ Task was not updated in Supabase."
            );

            return;
        }

        tasks[index] = updatedTask;

        console.log(
            "✅ Planner task updated successfully:",
            updatedTask
        );
    }

    editingTaskId = null;

    // =====================================
    // ADD NEW TASK
    // =====================================

    } else {

        const task = {
            id: Date.now(),
            title,
            description,
            category,
            priority,
            dueDate,
            status
        };

        const savedToSupabase =
            await saveTaskToSupabase(task);

        if (!savedToSupabase) {
            alert("❌ Task was not saved to Supabase.");
            return;
        }

        tasks.push(task);

        console.log(
            "✅ New Planner task added successfully:",
            task
        );
    }

    // =====================================
    // EXISTING UI / LOCAL STORAGE
    // =====================================

    saveToLocalStorage();
    loadSavedTasks();
    clearForm();
    closeTaskModal();
}

function openEditTaskModal(id) {

    if (!requireAdmin()) {
        return;
    }

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;

    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("taskCategory").value = task.category;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskDate").value = task.dueDate || "";
    document.getElementById("taskStatus").value = task.status;

    openTaskModal();
}

function saveToLocalStorage() {
    localStorage.setItem("churchhq_tasks", JSON.stringify(tasks));
}

// =====================================
// PLANNER - SUPABASE READ
// =====================================

// =====================================
// PLANNER - SUPABASE READ
// =====================================

async function loadTasksFromSupabase() {
    try {

        const { data, error } = await churchSupabase
            .from("planner_tasks")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(
                "❌ Failed to load planner tasks from Supabase:",
                error
            );
            return false;
        }

        tasks = (data || []).map(task => ({
            id: task.id,
            title: task.title || "",
            description: task.description || "",
            category: task.category || "",
            priority: task.priority || "",
            dueDate: task.due_date || "",
            status: task.status || "todo"
        }));

        // =====================================
        // RENDER PLANNER UI
        // =====================================

       if (typeof renderTask === "function") {

    // Clear existing Planner columns
    const todoCol =
        document.getElementById("todoColumn");

    const progCol =
        document.getElementById("progressColumn");

    const compCol =
        document.getElementById("completedColumn");

    if (todoCol) todoCol.innerHTML = "";
    if (progCol) progCol.innerHTML = "";
    if (compCol) compCol.innerHTML = "";

    // Render Supabase tasks
    tasks.forEach(task => renderTask(task));

    // Update counters
    updateCounters();
}

        console.log(
            "✅ Planner tasks loaded from Supabase:",
            tasks
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Planner Supabase read error:",
            error
        );

        return false;
    }
}
// =====================================
// PLANNER - SUPABASE INSERT
// =====================================

async function saveTaskToSupabase(task) {
    try {

        const { data, error } = await churchSupabase
            .from("planner_tasks")
            .insert([{
                id: task.id,
                title: task.title,
                description: task.description || "",
                category: task.category || "",
                priority: task.priority || "",
                due_date: task.dueDate || null,
                status: task.status || "todo"
            }])
            .select();

        if (error) {
            console.error(
                "❌ Failed to save task to Supabase:",
                error
            );
            return false;
        }

        console.log(
            "✅ Planner task saved to Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Planner Supabase insert error:",
            error
        );

        return false;
    }
}

// =====================================
// PLANNER - SUPABASE UPDATE
// =====================================

async function updateTaskToSupabase(task) {

    try {

        const { data, error } = await churchSupabase
            .from("planner_tasks")
            .update({
                title: task.title,
                description: task.description || "",
                category: task.category || "",
                priority: task.priority || "",
                due_date: task.dueDate || null,
                status: task.status || "todo"
            })
            .eq("id", task.id)
            .select();

        if (error) {

            console.error(
                "❌ Failed to update task in Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Planner task updated in Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Planner Supabase update error:",
            error
        );

        return false;
    }
}

// =====================================
// PLANNER - SUPABASE DELETE
// =====================================

async function deleteTaskFromSupabase(taskId) {

    try {

        const { data, error } = await churchSupabase
            .from("planner_tasks")
            .delete()
            .eq("id", taskId)
            .select();

        if (error) {

            console.error(
                "❌ Failed to delete task from Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Planner task deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Planner Supabase delete error:",
            error
        );

        return false;
    }
}

// =====================================
// SONGS - SUPABASE READ
// =====================================

async function loadSongsFromSupabase() {
    try {
        const { data, error } = await churchSupabase
            .from("songs")
            .select("*")
            .order("title", { ascending: true });

        if (error) {
            console.error(
                "❌ Failed to load songs from Supabase:",
                error
            );
            return false;
        }

        songs = data || [];

        // Keep existing localStorage behavior
        saveSongsToLocalStorage();

        // Keep existing Song Library rendering
        loadSavedSongs();

        console.log(
            "✅ Songs loaded from Supabase:",
            songs
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Songs Supabase read error:",
            error
        );

        return false;
    }
}

function loadSavedTasks() {
    try {
        const saved = localStorage.getItem("churchhq_tasks");
        if (saved) tasks = JSON.parse(saved);
    } catch (e) {
        tasks = [];
    }
    
    const todoCol = document.getElementById("todoColumn");
    const progCol = document.getElementById("progressColumn");
    const compCol = document.getElementById("completedColumn");

    if (todoCol) todoCol.innerHTML = "";
    if (progCol) progCol.innerHTML = "";
    if (compCol) compCol.innerHTML = "";

    tasks.forEach(task => renderTask(task));
    updateCounters();
}

function renderTask(task) {
    const card = document.createElement("div");
    card.className = "task-card";

    let priorityClass = "low";
    if (task.priority === "High") priorityClass = "high";
    if (task.priority === "Medium") priorityClass = "medium";

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h4>${task.title}</h4>
            <div style="display: flex; gap: 6px; align-items: center;">
                <button
    type="button"
    data-admin-only="true"
    onclick="openEditTaskModal(${task.id})"
    style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:14px;"
    title="Edit"
>
    ✏️
</button>

<button
    type="button"
    data-admin-only="true"
    onclick="deleteTask(${task.id})"
    style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size:18px;"
    title="Delete"
>
    &times;
</button>
            </div>
        </div>
        <p>${task.description || "<i>No description</i>"}</p>
        <p>📂 ${task.category}</p>
        <p>📅 ${task.dueDate || "-"}</p>
        <span class="priority ${priorityClass}">${task.priority}</span>
    `;

    if (task.status === "todo" && document.getElementById("todoColumn")) {
        document.getElementById("todoColumn").appendChild(card);
    } else if (task.status === "progress" && document.getElementById("progressColumn")) {
        document.getElementById("progressColumn").appendChild(card);
    } else if (task.status === "completed" && document.getElementById("completedColumn")) {
        document.getElementById("completedColumn").appendChild(card);
    }

    applyRoleBasedUI();
}

async function deleteTask(id) {

    if (!requireAdmin()) {
        return;
    }

    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    const deletedFromSupabase =
        await deleteTaskFromSupabase(id);

    if (!deletedFromSupabase) {

        alert(
            "❌ Task was not deleted from Supabase."
        );

        return;
    }

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveToLocalStorage();
    loadSavedTasks();

    console.log(
        "✅ Planner task deleted successfully:",
        id
    );
}

function updateCounters() {
    const todoCount = tasks.filter(t => t.status === "todo").length;
    const progressCount = tasks.filter(t => t.status === "progress").length;
    const completedCount = tasks.filter(t => t.status === "completed").length;

    const counters = document.querySelectorAll(".task-counter");
    if (counters.length >= 3) {
        counters[0].textContent = todoCount;
        counters[1].textContent = progressCount;
        counters[2].textContent = completedCount;
    }

    const dashboardTaskCount = document.getElementById("taskCount");
    if (dashboardTaskCount) {
        dashboardTaskCount.textContent = todoCount + progressCount;
    }
}

function clearForm() {
    editingTaskId = null;
    const tTitle = document.getElementById("taskTitle");
    const tDesc = document.getElementById("taskDescription");
    const tCat = document.getElementById("taskCategory");
    const tPrio = document.getElementById("taskPriority");
    const tDate = document.getElementById("taskDate");
    const tStat = document.getElementById("taskStatus");

    if (tTitle) tTitle.value = "";
    if (tDesc) tDesc.value = "";
    if (tCat) tCat.selectedIndex = 0;
    if (tPrio) tPrio.selectedIndex = 0;
    if (tDate) tDate.value = "";
    if (tStat) tStat.selectedIndex = 0;
}

/* =========================================
   SONG LIBRARY & SUNDAY SERVICE PLANNER ENGINE
========================================= */
let songs = [];
let sundayServiceSongs = [];
try {
    sundayServiceSongs = JSON.parse(localStorage.getItem("churchhq_sunday_lineup")) || [];
} catch (e) {
    sundayServiceSongs = [];
}

let currentActiveSong = null;
let currentTransposedKeyIndex = 0;
let editingSongId = null; 
const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const songModal = document.getElementById("songModal");
const addSongBtn = document.getElementById("addSongBtn");
const closeSongModal = document.getElementById("closeSongModal");
const cancelSong = document.getElementById("cancelSong");
const saveSongBtn = document.getElementById("saveSong");

const viewSongModal = document.getElementById("viewSongModal");
const closeViewSongModal = document.getElementById("closeViewSongModal");
const closeViewSongBtn = document.getElementById("closeViewSongBtn");

if (addSongBtn) {
    addSongBtn.addEventListener("click", () => {
        clearSongForm();
        if (songModal) songModal.classList.remove("hidden");
    });
}
if (closeSongModal) closeSongModal.addEventListener("click", () => { if (songModal) songModal.classList.add("hidden"); editingSongId = null; });
if (cancelSong) cancelSong.addEventListener("click", () => { if (songModal) songModal.classList.add("hidden"); editingSongId = null; });

if (closeViewSongModal) closeViewSongModal.addEventListener("click", () => { if (viewSongModal) viewSongModal.classList.add("hidden"); });
if (closeViewSongBtn) closeViewSongBtn.addEventListener("click", () => { if (viewSongModal) viewSongModal.classList.add("hidden"); });

if (saveSongBtn) saveSongBtn.addEventListener("click", saveSong);

function saveSong() {
    const title = document.getElementById("songTitle").value.trim();
    const artist = document.getElementById("songArtist").value.trim();
    const key = document.getElementById("songKey").value;
    const category = document.getElementById("songCategory").value;
    const lyrics = document.getElementById("songLyrics").value.trim();

    if (title === "") {
        alert("Please enter a song title.");
        return;
    }

if (editingSongId !== null) {
    songs = songs.map(song => {
        if (song.id === editingSongId) {
            return {
                ...song,
                title,
                artist: artist || "Unknown Artist",
                key,
                category,
                lyrics
            };
        }
        return song;
    });

    // Supabase UPDATE - existing songs only
    const updatedSong = songs.find(
        song => song.id === editingSongId
    );

    if (updatedSong) {
        updateSongToSupabase(updatedSong);
    }

    editingSongId = null;
}
    else {
    const song = {
        id: Date.now(),
        title,
        artist: artist || "Unknown Artist",
        key,
        category,
        lyrics
    };

    songs.push(song);

    // Supabase INSERT - new songs only
    saveSongToSupabase(song);
}

    saveSongsToLocalStorage();
    loadSavedSongs();
    clearSongForm();
    if (songModal) songModal.classList.add("hidden");
}

function openEditSongModal(id) {

    if (!requireAdmin()) {
        return;
    }

    const song = songs.find(s => s.id === id);
    if (!song) return;

    editingSongId = id;

    document.getElementById("songTitle").value = song.title;
    document.getElementById("songArtist").value = song.artist || "";
    document.getElementById("songKey").value = song.key;
    document.getElementById("songCategory").value = song.category;
    document.getElementById("songLyrics").value = song.lyrics || "";

    if (songModal) songModal.classList.remove("hidden");
}

function saveSongsToLocalStorage() {
    localStorage.setItem("churchhq_songs", JSON.stringify(songs));
}

function loadSavedSongs() {
    try {
        const saved = localStorage.getItem("churchhq_songs");
        if (saved) songs = JSON.parse(saved);
    } catch (e) {
        songs = [];
    }

    renderFullSongTable(songs);
    populateSongDropdown();
    renderServiceSongLineup();

    const songCountEl = document.getElementById("songCount");
    if (songCountEl) {
        songCountEl.textContent = songs.length;
    }
}

function renderFullSongTable(songsArray) {
    const tableBody = document.getElementById("fullSongTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (songsArray.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="padding: 15px; text-align: center; color: #94a3b8;">Walang nahanap na kanta sa library.</td></tr>`;
        return;
    }

    songsArray.forEach(song => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #f1f5f9";

        tr.innerHTML = `
            <td style="padding: 10px; font-weight: 600; color: #1e293b;">${song.title}</td>
            <td style="padding: 10px; color: #64748b;">${song.artist || '-'}</td>
            <td style="padding: 10px;"><span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${song.key}</span></td>
            <td style="padding: 10px;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${song.category}</span></td>
            <td style="padding: 10px; text-align: center; display: flex; justify-content: center; gap: 8px;">
                <button type="button" class="secondary-btn" style="padding: 3px 8px; font-size: 12px; cursor: pointer;" onclick="quickAddToServiceLineup(${song.id})" title="Add to Sunday Service">➕ Add</button>
                <button type="button" class="secondary-btn" style="padding: 3px 8px; font-size: 12px; cursor: pointer;" onclick="viewSong(${song.id})">👀 View</button>
                <button
    type="button"
    data-admin-only="true"
    onclick="openEditSongModal(${song.id})"
    style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:14px;"
    title="Edit"
>
    ✏️
</button>

<button
    type="button"
    data-admin-only="true"
    onclick="deleteSong(${song.id})"
    style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size:16px;"
    title="❌ Delete"
>
    &times;
</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

applyRoleBasedUI();

function populateSongDropdown() {
    const dropdown = document.getElementById("selectSongDropdown");
    if (!dropdown) return;

    dropdown.innerHTML = `<option value="">-- Select a Song from the Library --</option>`;
    songs.forEach(song => {
        const option = document.createElement("option");
        option.value = song.id;
        option.textContent = `${song.title} (${song.artist} - Key: ${song.key})`;
        dropdown.appendChild(option);
    });
}

function addSongToServiceLineup() {
    const dropdown = document.getElementById("selectSongDropdown");
    if (!dropdown) return;
    const songId = Number(dropdown.value);

    if (!songId) {
        alert("Please select a song from the dropdown first.");
        return;
    }

    const songToAdd = songs.find(s => s.id === songId);
    if (songToAdd) {
        sundayServiceSongs.push(songToAdd);
        saveAndRenderServiceLineup();
        dropdown.value = "";
    }
}

function quickAddToServiceLineup(songId) {
    const songToAdd = songs.find(s => s.id === songId);
    if (songToAdd) {
        sundayServiceSongs.push(songToAdd);
        saveAndRenderServiceLineup();
        alert(`✅ ${songToAdd.title}" has been added to the Sunday Service lineup`);
    }
}

function renderServiceSongLineup() {
    const lineupBody = document.getElementById("serviceSongLineupBody");
    if (!lineupBody) return;

    lineupBody.innerHTML = "";

    if (sundayServiceSongs.length === 0) {
        lineupBody.innerHTML = `<tr><td colspan="5" style="padding: 15px; text-align: center; color: #94a3b8;">There's no Song lineup for Sunday Service.</td></tr>`;
        return;
    }

    sundayServiceSongs.forEach((song, index) => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #f1f5f9";

        tr.innerHTML = `
            <td style="padding: 10px; font-weight: bold; color: #2563eb;">#${index + 1}</td>
            <td style="padding: 10px; font-weight: 600;">${song.title}</td>
            <td style="padding: 10px; color: #64748b;">${song.artist || '-'}</td>
            <td style="padding: 10px;"><span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${song.key}</span></td>
            <td style="padding: 10px; text-align: center; display: flex; justify-content: center; gap: 6px;">
                <button type="button" class="secondary-btn" style="padding: 3px 8px; font-size: 12px; cursor: pointer;" onclick="viewSong(${song.id})">👀 View</button>
                <button type="button" class="secondary-btn" style="padding: 3px 8px; font-size: 12px; color:#ef4444; border-color:#fca5a5; cursor: pointer;" onclick="removeSongFromServiceLineup(${index})">❌ Delete</button>
            </td>
        `;
        lineupBody.appendChild(tr);
    });
}

function removeSongFromServiceLineup(index) {
    sundayServiceSongs.splice(index, 1);
    saveAndRenderServiceLineup();
}

function saveAndRenderServiceLineup() {
    localStorage.setItem("churchhq_sunday_lineup", JSON.stringify(sundayServiceSongs));
    renderServiceSongLineup();
}

function filterSongTable(query) {
    const keyword = query.toLowerCase();
    const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(keyword) || 
        (song.artist && song.artist.toLowerCase().includes(keyword)) ||
        song.category.toLowerCase().includes(keyword)
    );
    renderFullSongTable(filtered);
}

function viewSong(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    currentActiveSong = song;
    let cleanKey = song.key.replace("m", "").toUpperCase();
    currentTransposedKeyIndex = scale.indexOf(cleanKey);
    if (currentTransposedKeyIndex === -1) currentTransposedKeyIndex = 0;

    const titleEl = document.getElementById("viewSongTitle");
    const subEl = document.getElementById("viewSongSubtitle");
    const modeEl = document.getElementById("viewDisplayMode");

    if (titleEl) titleEl.textContent = song.title;
    if (subEl) subEl.textContent = `Artist: ${song.artist} | Category: ${song.category}`;
    if (modeEl) modeEl.value = "both";

    updateSongViewDisplay();
    if (viewSongModal) viewSongModal.classList.remove("hidden");
}

function transposeSong(semitones) {
    if (!currentActiveSong) return;
    currentTransposedKeyIndex = (currentTransposedKeyIndex + semitones + 12) % 12;
    updateSongViewDisplay();
}

function updateSongViewDisplay() {
    if (!currentActiveSong) return;

    const displayModeEl = document.getElementById("viewDisplayMode");
    const displayMode = displayModeEl ? displayModeEl.value : "both";
    const isMinor = currentActiveSong.key.includes("m");
    const currentKeyStr = scale[currentTransposedKeyIndex] + (isMinor ? "m" : "");

    const keyDisplay = document.getElementById("currentKeyDisplay");
    if (keyDisplay) keyDisplay.textContent = `Key: ${currentKeyStr}`;

    let origKeyClean = currentActiveSong.key.replace("m", "").toUpperCase();
    let origIndex = scale.indexOf(origKeyClean);
    if (origIndex === -1) origIndex = 0;
    
    let shift = (currentTransposedKeyIndex - origIndex + 12) % 12;
    let processedText = currentActiveSong.lyrics || "No lyrics or chords available.";

    if (shift !== 0) {
        processedText = transposeText(processedText, shift);
    }

    const lines = processedText.split("\n");
    let filteredLines = [];

    lines.forEach(line => {
        const isChordLine = isLineChords(line);
        const isHeader = isSectionHeader(line);

        if (displayMode === "both") {
            filteredLines.push(line);
        } else if (displayMode === "chords") {
            if (isHeader) {
                filteredLines.push(line);
            } else if (isChordLine) {
                const chordRegex = /[A-G](?:#|b)?(?:m|maj|min|aug|dim|add|sus)?\d*/g;
                const matches = line.match(chordRegex);
                if (matches && matches.length > 0) {
                    filteredLines.push(matches.join("-"));
                }
            }
        } else if (displayMode === "lyrics" && !isChordLine) {
            filteredLines.push(line);
        }
    });

    const lyricsDisplay = document.getElementById("viewSongLyrics");
    if (lyricsDisplay) lyricsDisplay.textContent = filteredLines.join("\n");
}

function isSectionHeader(line) {
    const trimmed = line.trim().toLowerCase();
    const headers = ["verse", "chorus", "bridge", "intro", "outro", "pre-chorus", "interlude", "tag"];
    return headers.some(header => trimmed.includes(header));
}

function transposeText(text, semitones) {
    return text.replace(/\b[A-G](?:#|b)?(?:m|maj|min|aug|dim|add|sus)?\d*\b/g, (chord) => {
        return transposeChord(chord, semitones);
    });
}

function transposeChord(chord, semitones) {
    return chord.replace(/^[A-G](?:#|b)?/, (root) => {
        let index = scale.indexOf(root);
        if (root === "Db") index = 1;
        if (root === "Eb") index = 3;
        if (root === "Gb") index = 6;
        if (root === "Ab") index = 8;
        if (root === "Bb") index = 10;

        if (index === -1) return root;
        return scale[(index + semitones) % 12];
    });
}

function isLineChords(line) {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const tokens = trimmed.split(/\s+/);
    const chordRegex = /^[A-G](?:#|b)?(?:m|maj|min|aug|dim|add|sus)?\d*$/;
    const chordCount = tokens.filter(t => chordRegex.test(t)).length;
    return chordCount / tokens.length > 0.4;
}

async function deleteSong(id) {

    if (!requireAdmin()) {
        return;
    }

    if (confirm("Are you sure you want to delete this song?")) {

        const deletedFromSupabase =
            await deleteSongFromSupabase(id);

        if (!deletedFromSupabase) {
            alert(
                "❌ Failed to delete song from Supabase."
            );
            return;
        }

        songs = songs.filter(s => s.id !== id);
        saveSongsToLocalStorage();
        loadSavedSongs();
    }
}

function clearSongForm() {
    editingSongId = null;
    const sTitle = document.getElementById("songTitle");
    const sArt = document.getElementById("songArtist");
    const sKey = document.getElementById("songKey");
    const sCat = document.getElementById("songCategory");
    const sLyr = document.getElementById("songLyrics");

    if (sTitle) sTitle.value = "";
    if (sArt) sArt.value = "";
    if (sKey) sKey.selectedIndex = 0;
    if (sCat) sCat.selectedIndex = 0;
    if (sLyr) sLyr.value = "";
}

/* =========================================
   MEMBERS ENGINE
========================================= */
let members = [];

const memberModal = document.getElementById("memberModal");
const addMemberBtn = document.getElementById("addMemberBtn");
const closeMemberModal = document.getElementById("closeMemberModal");
const cancelMember = document.getElementById("cancelMember");
const saveMemberBtn = document.getElementById("saveMember");

if (addMemberBtn) {
    addMemberBtn.addEventListener("click", () => {
        clearMemberForm();
        const mTitle = document.getElementById("memberModalTitle");
        const editId = document.getElementById("editMemberId");
        if (mTitle) mTitle.textContent = "Add New Member";
        if (editId) editId.value = "";
        if (memberModal) memberModal.classList.remove("hidden");
    });
}

if (closeMemberModal) closeMemberModal.addEventListener("click", () => { if (memberModal) memberModal.classList.add("hidden"); });
if (cancelMember) cancelMember.addEventListener("click", () => { if (memberModal) memberModal.classList.add("hidden"); });
if (saveMemberBtn) saveMemberBtn.addEventListener("click", saveMember);


function getSelectedMemberMinistries() {
    const container = document.getElementById("memberMinistry");

    if (!container) {
        return [];
    }

    return Array.from(
        container.querySelectorAll('input[type="checkbox"]:checked')
    )
        .map(checkbox => checkbox.value.trim())
        .filter(value => value !== "");
}

async function saveMember() {

    if (!requireAdmin()) {
        return;
    }

    const editId = document.getElementById("editMemberId").value;
    const name = document.getElementById("memberName").value.trim();
    const contact = document.getElementById("memberContact").value.trim();
    const status = document.getElementById("memberStatus").value;
    const ministries = getSelectedMemberMinistries();
    const ministry = ministries[0] || "";
    const role = document.getElementById("memberRole").value.trim();
    const birthday = document.getElementById("memberBirthday").value;

    if (name === "") {
        alert("Please enter member name.");
        return;
    }

    if (ministries.length === 0) {
    alert("Please select at least one ministry.");
    return;
    }

    // =====================================
    // EDIT EXISTING MEMBER
    // =====================================
    if (editId) {

        const index = members.findIndex(m => m.id == editId);

        if (index !== -1) {

            const updatedMember = { 
                id: Number(editId), 
                name, 
                contact: contact || "No Contact", 
                status, 
                ministry,
                ministries,
                role: role || "Member", 
                birthday: birthday || null 
            };

            const updatedInSupabase =
                await updateMemberToSupabase(updatedMember);

            if (!updatedInSupabase) {
                alert("❌ Member was not updated in Supabase.");
                return;
            }

            members[index] = updatedMember;

            console.log(
                "✅ Member updated successfully:",
                updatedMember
            );
        }

    // =====================================
    // ADD NEW MEMBER
    // =====================================
    } else {

        const member = { 
            id: Date.now(), 
            name, 
            contact: contact || "No Contact", 
            status, 
            ministry,
            ministries,
            role: role || "Member", 
            birthday: birthday || null 
        };

        const savedToSupabase =
            await saveMemberToSupabase(member);

        if (!savedToSupabase) {
            alert("❌ Member was not saved to Supabase.");
            return;
        }

        members.push(member);

        console.log(
            "✅ New member added successfully:",
            member
        );
    }

    // =====================================
    // UPDATE EXISTING LOCAL UI/STORAGE
    // =====================================

    saveMembersToLocalStorage();
    loadSavedMembers();
    loadDashboardBirthdays();
    clearMemberForm();

    if (memberModal) {
        memberModal.classList.add("hidden");
    }
}


function saveMembersToLocalStorage() {
    localStorage.setItem(
        "churchhq_members",
        JSON.stringify(members)
    );
}

function loadSavedMembers() {
    try {
        const saved = localStorage.getItem("churchhq_members");

        if (saved) {
            members = JSON.parse(saved);
        }
    } catch (e) {
        members = [];
    }

    const membersGrid = document.getElementById("membersGrid");
    if (!membersGrid) return;

    // =====================================
    // SORT MEMBERS ALPHABETICALLY BY NAME
    // =====================================

    const sortedMembers = [...members].sort((a, b) =>
        (a.name || "").localeCompare(
            (b.name || ""),
            undefined,
            { sensitivity: "base" }
        )
    );

    membersGrid.innerHTML = "";

    sortedMembers.forEach(member => {
        renderMemberCard(member);
    });

    const memberCountEl =
        document.getElementById("memberCount");

    if (memberCountEl) {
        memberCountEl.textContent = members.length;
    }

    // =====================================
    // UPDATE MINISTRY FILTER
    // =====================================

    populateMemberMinistryFilter();
}

/* =========================================
   SERVICE MEMBER AUTOCOMPLETE
   SUNDAY + MIDWEEK
========================================= */

function setupServiceMemberAutocomplete(inputId) {

    const input = document.getElementById(inputId);

    if (!input) return;


    // Prevent duplicate initialization
    if (input.dataset.autocompleteReady === "true") {
        return;
    }

    input.dataset.autocompleteReady = "true";


    // Create wrapper
    const wrapper = document.createElement("div");

    wrapper.className = "member-autocomplete-wrapper";


    // Insert wrapper before input
    input.parentNode.insertBefore(wrapper, input);

    // Move input inside wrapper
    wrapper.appendChild(input);


    // Suggestion container
    const suggestionBox =
        document.createElement("div");

    suggestionBox.className =
        "member-autocomplete-list";

    suggestionBox.style.display = "none";

    wrapper.appendChild(suggestionBox);


    // =====================================
    // SEARCH MEMBERS
    // =====================================

    input.addEventListener("input", function () {

        const search =
            input.value
                .trim()
                .toLowerCase();


        suggestionBox.innerHTML = "";


        if (!search) {

            suggestionBox.style.display =
                "none";

            return;

        }


        const filteredMembers =
            members
                .filter(member => {

                    const name =
                        (member.name || "")
                            .toLowerCase();

                    return name.includes(search);

                })
                .sort((a, b) =>
                    (a.name || "").localeCompare(
                        b.name || ""
                    )
                )
                .slice(0, 8);


        if (filteredMembers.length === 0) {

            suggestionBox.innerHTML = `
                <div class="member-autocomplete-empty">
                    No member found.
                </div>
            `;

            suggestionBox.style.display =
                "block";

            return;
        }


        filteredMembers.forEach(member => {

            const item =
                document.createElement("div");

            item.className =
                "member-autocomplete-item";


            const ministryText =
                Array.isArray(member.ministries) &&
                member.ministries.length > 0

                    ? member.ministries.join(", ")

                    : member.ministry ||
                      "No Ministry";


            item.innerHTML = `

                <div class="member-autocomplete-name">
                    ${member.name || ""}
                </div>

                <div class="member-autocomplete-meta">

                    ${ministryText}

                    ${
                        member.role
                            ? " • " + member.role
                            : ""
                    }

                </div>

            `;


            item.addEventListener(
                "mousedown",
                function (event) {

                    event.preventDefault();

                    input.value =
                        member.name || "";

                    suggestionBox.style.display =
                        "none";

                }
            );


            suggestionBox.appendChild(item);

        });


        suggestionBox.style.display =
            "block";

    });


    // =====================================
    // SHOW AGAIN ON FOCUS
    // =====================================

    input.addEventListener(
        "focus",
        function () {

            if (
                input.value.trim() !== ""
            ) {

                input.dispatchEvent(
                    new Event("input")
                );

            }

        }
    );


    // =====================================
    // CLOSE SUGGESTIONS
    // =====================================

    input.addEventListener(
        "blur",
        function () {

            setTimeout(() => {

                suggestionBox.style.display =
                    "none";

            }, 150);

        }
    );

}


/* =========================================
   INITIALIZE SERVICE MEMBER AUTOCOMPLETE
========================================= */

function initializeServiceMemberAutocomplete() {

    const servicePrefixes = [
        "sun",
        "mid"
    ];


    const memberFields = [

        "worshipLeader",
        "keys",
        "guitar",
        "bass",
        "drums",
        "pptOperator",
        "soundEngineer",
        "liveStream",
        "preacher"

    ];


    servicePrefixes.forEach(prefix => {

        memberFields.forEach(field => {

            setupServiceMemberAutocomplete(
                `${prefix}_${field}`
            );

        });

    });

}

/* =========================================
   BACKING VOCALS MULTI-MEMBER AUTOCOMPLETE
   SUNDAY + MIDWEEK
========================================= */

function setupBackingVocalsAutocomplete(inputId) {

    const input = document.getElementById(inputId);

    if (!input) return;

    if (input.dataset.multiAutocompleteReady === "true") {
        return;
    }

    input.dataset.multiAutocompleteReady = "true";


    // Create wrapper
    const wrapper = document.createElement("div");

    wrapper.className = "member-autocomplete-wrapper";

    input.parentNode.insertBefore(wrapper, input);

    wrapper.appendChild(input);


    // Suggestion box
    const suggestionBox =
        document.createElement("div");

    suggestionBox.className =
        "member-autocomplete-list";

    suggestionBox.style.display = "none";

    wrapper.appendChild(suggestionBox);


    // =====================================
    // SEARCH
    // =====================================

    input.addEventListener("input", function () {

        const fullValue =
            input.value || "";


        // Split existing selected names
        const parts =
            fullValue.split(",");


        // Current text after last comma
        const currentSearch =
            parts[parts.length - 1]
                .trim()
                .toLowerCase();


        suggestionBox.innerHTML = "";


        if (!currentSearch) {

            suggestionBox.style.display =
                "none";

            return;
        }


        // Already selected names
        const selectedNames =
            parts
                .slice(0, -1)
                .map(name =>
                    name.trim().toLowerCase()
                )
                .filter(Boolean);


        const filteredMembers =
            members
                .filter(member => {

                    const memberName =
                        (member.name || "")
                            .toLowerCase();


                    const matchesSearch =
                        memberName.includes(
                            currentSearch
                        );


                    const alreadySelected =
                        selectedNames.includes(
                            memberName
                        );


                    return (
                        matchesSearch &&
                        !alreadySelected
                    );

                })
                .sort((a, b) =>
                    (a.name || "").localeCompare(
                        b.name || ""
                    )
                )
                .slice(0, 8);


        if (filteredMembers.length === 0) {

            suggestionBox.innerHTML = `
                <div class="member-autocomplete-empty">
                    No member found.
                </div>
            `;

            suggestionBox.style.display =
                "block";

            return;
        }


        filteredMembers.forEach(member => {

            const item =
                document.createElement("div");

            item.className =
                "member-autocomplete-item";


            const ministryText =
                Array.isArray(member.ministries) &&
                member.ministries.length > 0
                    ? member.ministries.join(", ")
                    : member.ministry ||
                      "No Ministry";


            item.innerHTML = `

                <div class="member-autocomplete-name">
                    ${member.name || ""}
                </div>

                <div class="member-autocomplete-meta">

                    ${ministryText}

                    ${
                        member.role
                            ? " • " + member.role
                            : ""
                    }

                </div>

            `;


            item.addEventListener(
                "mousedown",
                function (event) {

                    event.preventDefault();


                    // Existing completed selections
                    const existing =
                        parts
                            .slice(0, -1)
                            .map(name =>
                                name.trim()
                            )
                            .filter(Boolean);


                    // Add selected member
                    existing.push(
                        member.name
                    );


                    input.value =
                        existing.join(", ") + ", ";


                    suggestionBox.style.display =
                        "none";


                    // Put cursor back into input
                    input.focus();

                }
            );


            suggestionBox.appendChild(item);

        });


        suggestionBox.style.display =
            "block";

    });


    // =====================================
    // CLOSE ON BLUR
    // =====================================

    input.addEventListener(
        "blur",
        function () {

            setTimeout(() => {

                suggestionBox.style.display =
                    "none";

            }, 150);

        }
    );

}


/* =========================================
   INITIALIZE BACKING VOCALS AUTOCOMPLETE
========================================= */

function initializeBackingVocalsAutocomplete() {

    setupBackingVocalsAutocomplete(
        "sun_backingVocals"
    );

    setupBackingVocalsAutocomplete(
        "mid_backingVocals"
    );

}

function populateMemberMinistryFilter() {

    const filter =
        document.getElementById("memberMinistryFilter");

    if (!filter) return;

    // Clear existing options
    filter.innerHTML = "";

    // Default option
    const allOption = document.createElement("option");

    allOption.value = "";
    allOption.textContent = "All Ministries";

    filter.appendChild(allOption);

    // Store unique ministries
    const ministries = new Set();

    members.forEach(member => {

        // New multiple-ministry format
        if (
            Array.isArray(member.ministries)
        ) {

            member.ministries.forEach(ministry => {

                if (
                    typeof ministry === "string" &&
                    ministry.trim() !== ""
                ) {
                    ministries.add(
                        ministry.trim()
                    );
                }

            });

        }

        // Support old single-ministry data
        else if (
            typeof member.ministry === "string" &&
            member.ministry.trim() !== ""
        ) {

            ministries.add(
                member.ministry.trim()
            );

        }

    });

    // Sort ministries alphabetically
    const sortedMinistries =
        Array.from(ministries).sort((a, b) =>
            a.localeCompare(
                b,
                undefined,
                { sensitivity: "base" }
            )
        );

    // Add ministries to dropdown
    sortedMinistries.forEach(ministry => {

        const option =
            document.createElement("option");

        option.value = ministry;
        option.textContent = ministry;

        filter.appendChild(option);
    });
}

function filterMembers() {

    const searchInput =
        document.getElementById("memberSearch");

    const ministryFilter =
        document.getElementById("memberMinistryFilter");

    const membersGrid =
        document.getElementById("membersGrid");

    if (!membersGrid) return;

    const searchQuery =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const selectedMinistry =
        ministryFilter
            ? ministryFilter.value
            : "";

    // =====================================
    // FILTER MEMBERS
    // =====================================

    const filteredMembers = members.filter(member => {

        // -------------------------------
        // SEARCH
        // -------------------------------

        const ministries = Array.isArray(member.ministries)
            ? member.ministries
            : (
                member.ministry
                    ? [member.ministry]
                    : []
            );

        const searchText = [
            member.name || "",
            member.contact || "",
            member.status || "",
            member.role || "",
            ...ministries
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            searchQuery === "" ||
            searchText.includes(searchQuery);

        // -------------------------------
        // MINISTRY FILTER
        // -------------------------------

        const matchesMinistry =
            selectedMinistry === "" ||
            ministries.includes(selectedMinistry);

        return matchesSearch && matchesMinistry;
    });

    // =====================================
    // SORT ALPHABETICALLY
    // =====================================

    filteredMembers.sort((a, b) =>
        (a.name || "").localeCompare(
            (b.name || ""),
            undefined,
            { sensitivity: "base" }
        )
    );

    // =====================================
    // RENDER RESULTS
    // =====================================

    membersGrid.innerHTML = "";

    filteredMembers.forEach(member => {
        renderMemberCard(member);
    });
}

const memberSearch =
    document.getElementById("memberSearch");

if (memberSearch) {

    memberSearch.addEventListener("input", () => {
        filterMembers();
    });

}

const memberMinistryFilter =
    document.getElementById("memberMinistryFilter");

if (memberMinistryFilter) {

    memberMinistryFilter.addEventListener("change", () => {
        filterMembers();
    });

}

function renderMemberCard(member) {
    const membersGrid = document.getElementById("membersGrid");
    if (!membersGrid) return;

    const card = document.createElement("div");
    card.className = "song-card";

    const ministries = Array.isArray(member.ministries) && member.ministries.length > 0
        ? member.ministries
        : (member.ministry ? [member.ministry] : []);

    const ministryText = ministries.join(", ");

    card.innerHTML = `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0;">${member.name}</h3>
                <span class="status-badge" style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-size:12px;">${member.status}</span>
            </div>

            <p class="artist">📞 ${member.contact}</p>

            <div style="margin-top: 10px; font-size: 12px; color:#64748b;">
                <span>🏛️ ${ministryText}</span> |
                <span>💼 ${member.role}</span>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:15px;">
            <button
                type="button"
                class="secondary-btn"
                style="padding: 4px 10px; font-size: 12px;"
                onclick="editMember(${member.id})"
            >
                ✏️ Edit
            </button>

            <button
                type="button"
                onclick="deleteMember(${member.id})"
                style="background:none; border:none; color:#ef4444; cursor:pointer; font-size: 16px; font-weight:bold;"
            >
                &times;
            </button>
        </div>
    `;

    membersGrid.appendChild(card);
}

function editMember(id) {

    if (!requireAdmin()) {
        return;
    }

    const member = members.find(m => m.id === id);
    if (!member) return;

    const mTitle = document.getElementById("memberModalTitle");
    const editId = document.getElementById("editMemberId");
    const mName = document.getElementById("memberName");
    const mContact = document.getElementById("memberContact");
    const mStatus = document.getElementById("memberStatus");
    const ministrySelect = document.getElementById("memberMinistry");
    const mRole = document.getElementById("memberRole");
    const mBirthday = document.getElementById("memberBirthday");

    if (mTitle) mTitle.textContent = "Edit Member";
    if (editId) editId.value = member.id;
    if (mName) mName.value = member.name;
    if (mContact) mContact.value = member.contact;
    if (mStatus) mStatus.value = member.status;

    // =====================================
    // LOAD MEMBER MINISTRIES
    // =====================================

    if (ministrySelect) {

        const selectedMinistries =
            Array.isArray(member.ministries) &&
            member.ministries.length > 0
                ? member.ministries
                : (member.ministry ? [member.ministry] : []);

        const checkboxes =
            ministrySelect.querySelectorAll(
                'input[type="checkbox"]'
            );

        checkboxes.forEach(checkbox => {
            checkbox.checked =
                selectedMinistries.includes(checkbox.value);
        });
    }

    if (mRole) mRole.value = member.role;

    if (mBirthday) {
        mBirthday.value = member.birthday || "";
    }

    if (memberModal) {
        memberModal.classList.remove("hidden");
    }
}

function addCustomMinistry() {

    if (!requireAdmin()) {
        return;
    }

    const newMinistry = prompt("Enter new Ministry Group name:");

    if (newMinistry && newMinistry.trim() !== "") {

        const container = document.getElementById("memberMinistry");

        if (container) {

            const ministryName = newMinistry.trim();

            // Prevent duplicate ministry
            const existingCheckboxes =
                container.querySelectorAll('input[type="checkbox"]');

            const alreadyExists = Array.from(existingCheckboxes)
                .some(checkbox => checkbox.value === ministryName);

            if (alreadyExists) {
                alert(`"${ministryName}" already exists.`);
                return;
            }

            // Create checkbox
            const label = document.createElement("label");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = ministryName;

            const span = document.createElement("span");
            span.textContent = ministryName;

            label.appendChild(checkbox);
            label.appendChild(span);

            container.appendChild(label);

            // Automatically select newly added ministry
            checkbox.checked = true;

            alert(`Added "${ministryName}" to Ministry list!`);
        }
    }
}

async function deleteMember(id) {

    if (!requireAdmin()) {
        return;
    }

    if (!confirm("Are you sure you want to delete this member?")) {
        return;
    }

    const deletedFromSupabase =
        await deleteMemberFromSupabase(id);

    if (!deletedFromSupabase) {
        alert("❌ Member was not deleted from Supabase.");
        return;
    }

    members = members.filter(m => m.id !== id);

    saveMembersToLocalStorage();
    loadSavedMembers();
    loadDashboardBirthdays();

    loadDashboardBirthdays();
    console.log(
        "✅ Member deleted successfully:",
        id
    );
}

function clearMemberForm() {

    const editId = document.getElementById("editMemberId");
    const mName = document.getElementById("memberName");
    const mContact = document.getElementById("memberContact");
    const mStatus = document.getElementById("memberStatus");
    const ministrySelect = document.getElementById("memberMinistry");
    const mRole = document.getElementById("memberRole");
    const mBirthday = document.getElementById("memberBirthday");

    if (editId) editId.value = "";
    if (mName) mName.value = "";
    if (mContact) mContact.value = "";
    if (mStatus) mStatus.selectedIndex = 0;

    if (ministrySelect) {
        const checkboxes =
            ministrySelect.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    if (mRole) mRole.value = "";
    if (mBirthday) mBirthday.value = "";
}

/* =========================================
   DASHBOARD BIRTHDAY
========================================= */

function loadDashboardBirthdays() {

    const birthdayList =
        document.getElementById("birthdayList");

    if (!birthdayList) return;


    const currentMonth =
        new Date().getMonth();


    const birthdayMembers =
        members.filter(member => {

            if (!member.birthday) return false;


            const birthday =
                new Date(member.birthday);


            return birthday.getMonth() === currentMonth;

        });


    birthdayList.innerHTML = "";


    if (birthdayMembers.length === 0) {

        birthdayList.innerHTML = `
            <p style="color:#6b7280;">
                No birthdays this month.
            </p>
        `;

        return;

    }


    birthdayMembers.forEach(member => {


        const date =
            new Date(member.birthday);


        const formattedDate =
            date.toLocaleDateString(
                "en-US",
                {
                    month:"long",
                    day:"numeric"
                }
            );


        birthdayList.innerHTML += `

    <div style="
        padding:8px 0;
        border-bottom:1px solid #e5e7eb;
    ">
        🎂 <b>${member.name}</b> - ${formattedDate}
    </div>

`;

    });

}

/* =========================================
   DASHBOARD BIRTHDAY THIS MONTH
========================================= */

function loadDashboardBirthdays() {

    const birthdayList =
        document.getElementById("birthdayList");

    if (!birthdayList) return;


    const currentMonth =
        new Date().getMonth();


    const birthdayMembers =
        members.filter(member => {

            if (!member.birthday) return false;


            const birthdayDate =
                new Date(member.birthday);


            return birthdayDate.getMonth() === currentMonth;

        });


    birthdayList.innerHTML = "";


    if (birthdayMembers.length === 0) {

        birthdayList.innerHTML = `
            <p style="color:#6b7280;">
                No birthdays this month.
            </p>
        `;

        return;
    }


    birthdayMembers.forEach(member => {

        const birthdayDate =
            new Date(member.birthday);


        const formattedDate =
            birthdayDate.toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    day: "numeric"
                }
            );


        birthdayList.innerHTML += `

    <div style="
        padding:8px 0;
        border-bottom:1px solid #e5e7eb;
    ">
        🎂 <b>${member.name}</b> - ${formattedDate}
    </div>

`;

    });

}

/* =========================================
   ATTENDANCE ENGINE
========================================= */
let attendanceRecords = [];
let currentCheckIns = {};
let selectedAttendanceYear = new Date().getFullYear();

const attDateInput = document.getElementById("attDate");
const attServiceType = document.getElementById("attServiceType");
const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");

if (attDateInput) {
    attDateInput.value = new Date().toISOString().split("T")[0];
    attDateInput.addEventListener("change", loadAttendanceForDate);
}

if (attServiceType) {
    attServiceType.addEventListener("change", loadAttendanceForDate);
}

if (saveAttendanceBtn) saveAttendanceBtn.addEventListener("click", saveAttendance);

function loadAttendanceForDate() {
    if (!attDateInput) return;

    const selectedDate = attDateInput.value;

    const selectedServiceType =
        attServiceType
            ? attServiceType.value
            : "sunday";

    const existingRecord =
        attendanceRecords.find(
            r =>
                r.date === selectedDate &&
                (r.serviceType || "sunday") === selectedServiceType
        );

    const attEventName =
        document.getElementById("attEventName");

    if (existingRecord) {

        if (attEventName) {
            attEventName.value =
                existingRecord.eventName ||
                (
                    selectedServiceType === "midweek"
                        ? "Midweek Service"
                        : "Sunday General Service"
                );
        }

        currentCheckIns =
            { ...(existingRecord.checkIns || {}) };

    } else {

        currentCheckIns = {};

        if (attEventName) {
            attEventName.value =
                selectedServiceType === "midweek"
                    ? "Midweek Service"
                    : "Sunday General Service";
        }
    }

    renderAttendanceList();
}   

function renderAttendanceList() {
    const listEl = document.getElementById("attendanceList");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (members.length === 0) {
        listEl.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 20px;">
                No members found. Please add members in the <b>Members Tab</b> first.
            </p>
        `;
        return;
    }

    // =====================================
    // GET SEARCH QUERY
    // =====================================

    const searchInput =
        document.getElementById("attendanceSearch");

    const searchQuery = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    // =====================================
    // SORT MEMBERS A-Z
    // =====================================

    const sortedMembers = [...members].sort((a, b) =>
        (a.name || "").localeCompare(
            (b.name || ""),
            undefined,
            { sensitivity: "base" }
        )
    );

    // =====================================
    // SEARCH
    // =====================================

    let visibleMembers;

    if (searchQuery !== "") {

        visibleMembers = sortedMembers.filter(member => {

            const ministries =
                Array.isArray(member.ministries)
                    ? member.ministries
                    : (
                        member.ministry
                            ? [member.ministry]
                            : []
                    );

            const searchableText = [
                member.name || "",
                member.contact || "",
                member.status || "",
                member.role || "",
                ...ministries
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchQuery);
        });

    } else {

        // =====================================
        // SHOW ONLY FIRST 15 MEMBERS
        // =====================================

        visibleMembers = sortedMembers.slice(0, 15);
    }

    // =====================================
    // DISPLAY MEMBERS
    // =====================================

    visibleMembers.forEach(member => {

        const isChecked =
            !!currentCheckIns[member.id];

        const card =
            document.createElement("div");

        card.className =
            `att-card ${isChecked ? "checked" : ""}`;

        card.onclick = (e) => {

            if (e.target.tagName !== "INPUT") {
                toggleCheckIn(member.id);
            }

        };

        const ministries =
            Array.isArray(member.ministries) &&
            member.ministries.length > 0
                ? member.ministries
                : (
                    member.ministry
                        ? [member.ministry]
                        : []
                );

        const ministryText =
            ministries.join(", ");

        card.innerHTML = `
            <div>
                <h4 style="margin: 0; font-size: 15px;">
                    ${member.name}
                </h4>

                <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">
                    🏛️ ${ministryText}
                </p>
            </div>

            <input
                type="checkbox"
                ${isChecked ? "checked" : ""}
                onchange="toggleCheckIn(${member.id})"
            >
        `;

        listEl.appendChild(card);
    });

    // =====================================
    // NO SEARCH RESULTS
    // =====================================

    if (
        searchQuery !== "" &&
        visibleMembers.length === 0
    ) {

        listEl.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 20px;">
                No members found matching
                "<b>${searchQuery}</b>".
            </p>
        `;
    }

    // =====================================
    // ATTENDANCE COUNTS
    // =====================================

    const totalCount =
        members.length;

    const presentCount =
        Object.values(currentCheckIns)
            .filter(Boolean)
            .length;

    const absentCount =
        totalCount - presentCount;

    if (document.getElementById("attTotalCount")) {
        document.getElementById("attTotalCount").textContent =
            totalCount;
    }

    if (document.getElementById("attPresentCount")) {
        document.getElementById("attPresentCount").textContent =
            presentCount;
    }

    if (document.getElementById("attAbsentCount")) {
        document.getElementById("attAbsentCount").textContent =
            absentCount;
    }
}

const attendanceSearch =
    document.getElementById("attendanceSearch");

if (attendanceSearch) {
    attendanceSearch.addEventListener("input", () => {
        renderAttendanceList();
    });
}

function toggleCheckIn(memberId) {

    if (!requireAdmin()) {
        return;
    }

    currentCheckIns[memberId] = !currentCheckIns[memberId];
    renderAttendanceList();

}

function markAllAttendance(status) {

    if (!requireAdmin()) {
        return;
    }

    members.forEach(member => {
        currentCheckIns[member.id] = status;
    });

    renderAttendanceList();
}


async function saveAttendance() {

    if (!attDateInput) return;

    const date = attDateInput.value;

    const eventNameEl =
        document.getElementById("attEventName");

    const eventName =
        eventNameEl
            ? eventNameEl.value.trim()
            : "Event";

            const serviceType =
         attServiceType
        ? attServiceType.value
        : "sunday";

    if (!date) {
        alert("Please select a date.");
        return;
    }

    const index =
    attendanceRecords.findIndex(
        r =>
            r.date === date &&
            (r.serviceType || "sunday") === serviceType
    );

    const recordData = {
    date,
    eventName,
    serviceType,
    checkIns: currentCheckIns,
    totalMembers: members.length,
    presentCount:
        Object.values(currentCheckIns)
            .filter(Boolean).length
};

    // =====================================
    // EXISTING RECORD
    // =====================================

    if (index !== -1) {

    const updatedInSupabase =
        await updateAttendanceToSupabase(recordData);

    if (!updatedInSupabase) {

        alert(
            "❌ Attendance was not updated in Supabase."
        );

        return;
    }

    attendanceRecords[index] = {
        ...recordData,
        id: attendanceRecords[index].id
    };

} else {

        const savedToSupabase =
            await saveAttendanceToSupabase(recordData);

        if (!savedToSupabase) {

            alert(
                "❌ Attendance was not saved to Supabase."
            );

            return;
        }

        attendanceRecords.push(recordData);
    }

    localStorage.setItem(
        "churchhq_attendance",
        JSON.stringify(attendanceRecords)
    );

    alert(
        `Attendance for "${eventName}" (${date}) saved successfully! 🎉`
    );
}

function loadSavedAttendance() {

    try {

        const saved =
            localStorage.getItem(
                "churchhq_attendance"
            );

        if (saved) {
            attendanceRecords =
                JSON.parse(saved);
        }

    } catch (e) {

        attendanceRecords = [];

    }

    if (attDateInput) {
        loadAttendanceForDate();
    }
    loadAttendanceYearSelector();
    renderAttendanceSummary();
}
// =====================================
// ATTENDANCE - SUPABASE READ
// =====================================

async function loadAttendanceFromSupabase() {

    try {

        const { data, error } = await churchSupabase
            .from("attendance_records")
            .select("*")
            .order("date", { ascending: false });

        if (error) {

            console.error(
                "❌ Failed to load attendance from Supabase:",
                error
            );

            return false;
        }

        attendanceRecords = (data || []).map(record => ({
            id: record.id,
            date: record.date || "",
            eventName: record.event_name || "Event",
            serviceType: record.service_type || "sunday",
            checkIns: record.check_ins || {},
            totalMembers: record.total_members || 0,
            presentCount: record.present_count || 0
        }));

        console.log(
            "✅ Attendance records loaded from Supabase:",
            attendanceRecords
        );


        // =====================================
        // ATTENDANCE YEAR SELECTOR
        // =====================================

        if (
            typeof loadAttendanceYearSelector ===
            "function"
        ) {

            loadAttendanceYearSelector();

        }


        // =====================================
        // LOAD CURRENT DATE ATTENDANCE
        // =====================================

        if (attDateInput) {

            loadAttendanceForDate();

        }


        // =====================================
        // ATTENDANCE HISTORY
        // =====================================

        renderAttendanceHistory();


        // =====================================
        // ATTENDANCE SUMMARY
        // =====================================

        if (
            typeof renderAttendanceSummary ===
            "function"
        ) {

            renderAttendanceSummary();

        }


        // =====================================
        // TOP ATTENDANCE
        // =====================================

        if (
            typeof renderTopAttendance ===
            "function"
        ) {

            renderTopAttendance();

        }


        return true;

    } catch (error) {

        console.error(
            "❌ Attendance Supabase read error:",
            error
        );

        return false;
    }
}

function renderTopAttendance(){

    const container =
        document.getElementById(
            "topAttendanceList"
        );

    if(!container) return;


    const summary =
        calculateMemberAttendanceSummary();


    const top =
        summary
        .sort(
            (a,b) =>
            b.totalPresent -
            a.totalPresent
        )
        .slice(0,5);


    container.innerHTML = "";


    if(top.length === 0){

        container.innerHTML =
        `
        <p style="
            color:#6b7280;
        ">
            No attendance records found
            for ${selectedAttendanceYear}.
        </p>
        `;

        return;
    }



    top.forEach((member,index)=>{


        container.innerHTML +=
        `
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:10px;
            border-bottom:1px solid #e5e7eb;
        ">

            <div>
                <b>
                ${index + 1}.
                ${member.name}
                </b>
            </div>


            <div style="
                font-weight:bold;
                color:#16a34a;
            ">
                ${member.totalPresent}
                times
            </div>

        </div>
        `;


    });


}

// =====================================
// ATTENDANCE - SUPABASE INSERT
// =====================================

async function saveAttendanceToSupabase(record) {

    try {

        const attendanceId = Date.now();

        const { data, error } = await churchSupabase
            .from("attendance_records")
            .insert([{
                id: attendanceId,
                date: record.date,
                event_name: record.eventName || "",
                service_type: record.serviceType || "sunday",
                check_ins: record.checkIns || {},
                total_members: record.totalMembers || 0,
                present_count: record.presentCount || 0
            }])

        if (error) {

            console.error(
                "❌ Failed to save attendance to Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Attendance saved to Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Attendance Supabase insert error:",
            error
        );

        return false;
    }
}

// =====================================
// ATTENDANCE - SUPABASE UPDATE
// =====================================

async function updateAttendanceToSupabase(record) {

    try {

        const { data, error } = await churchSupabase
    .from("attendance_records")
    .update({
        event_name: record.eventName || "",
        service_type: record.serviceType || "sunday",
        check_ins: record.checkIns || {},
        total_members: record.totalMembers || 0,
        present_count: record.presentCount || 0
    })
    .eq("date", record.date)
    .eq("service_type", record.serviceType || "sunday")
    .select();

        if (error) {

            console.error(
                "❌ Failed to update attendance in Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Attendance updated in Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Attendance Supabase update error:",
            error
        );

        return false;
    }
}

/* =========================================
   MEMBER ATTENDANCE SUMMARY
========================================= */

function calculateMemberAttendanceSummary() {

    const summary = {};

    const currentYear =
        Number(selectedAttendanceYear);


    attendanceRecords.forEach(record => {


        const recordYear =
            new Date(record.date).getFullYear();


        // Skip ibang taon
        if (recordYear !== currentYear) {
            return;
        }


        const serviceType =
            record.serviceType || "sunday";


        const checkIns =
            record.checkIns || {};


        Object.keys(checkIns).forEach(memberId => {


            if (!checkIns[memberId]) return;


            const member =
                members.find(
                    m => m.id == memberId
                );


            if (!member) return;


            if (!summary[memberId]) {

                summary[memberId] = {

                    id: member.id,

                    name: member.name || "",

                    sundayPresent: 0,

                    midweekPresent: 0,

                    totalPresent: 0

                };

            }


            if (serviceType === "sunday") {

                summary[memberId]
                    .sundayPresent++;

            }


            else if (serviceType === "midweek") {

                summary[memberId]
                    .midweekPresent++;

            }


            summary[memberId]
                .totalPresent++;


        });


    });


    return Object.values(summary);

}

/* =========================================
   MEMBER ATTENDANCE ANALYTICS
   STEP 4A
========================================= */

function calculateMemberAttendanceAnalytics() {

    const year =
        Number(selectedAttendanceYear);


    // =====================================
    // RECORDS FOR SELECTED YEAR
    // =====================================

    const yearRecords =
        attendanceRecords.filter(record => {

            if (!record.date) {
                return false;
            }

            const recordYear =
                new Date(
                    record.date
                ).getFullYear();

            return recordYear === year;

        });


    // =====================================
    // TOTAL SERVICES
    // =====================================

    const sundayRecords =
        yearRecords.filter(record =>
            (record.serviceType || "sunday") ===
            "sunday"
        );


    const midweekRecords =
        yearRecords.filter(record =>
            record.serviceType ===
            "midweek"
        );


    const totalSundayServices =
        sundayRecords.length;

    const totalMidweekServices =
        midweekRecords.length;

    const totalServices =
        totalSundayServices +
        totalMidweekServices;


    // =====================================
    // ANALYTICS PER MEMBER
    // =====================================

    const analytics =
        members.map(member => {

            let sundayPresent = 0;
            let midweekPresent = 0;

            let lastAttendedDate = null;


            yearRecords.forEach(record => {

                const checkIns =
                    record.checkIns || {};


                if (!checkIns[member.id]) {
                    return;
                }


                const serviceType =
                    record.serviceType ||
                    "sunday";


                if (
                    serviceType ===
                    "sunday"
                ) {

                    sundayPresent++;

                } else if (
                    serviceType ===
                    "midweek"
                ) {

                    midweekPresent++;

                }


                const attendanceDate =
                    new Date(record.date);


                if (
                    !lastAttendedDate ||
                    attendanceDate >
                    lastAttendedDate
                ) {

                    lastAttendedDate =
                        attendanceDate;

                }

            });


            const totalPresent =
                sundayPresent +
                midweekPresent;


            const sundayRate =
                totalSundayServices > 0
                    ? Math.round(
                        (
                            sundayPresent /
                            totalSundayServices
                        ) * 100
                    )
                    : 0;


            const midweekRate =
                totalMidweekServices > 0
                    ? Math.round(
                        (
                            midweekPresent /
                            totalMidweekServices
                        ) * 100
                    )
                    : 0;


            const overallRate =
                totalServices > 0
                    ? Math.round(
                        (
                            totalPresent /
                            totalServices
                        ) * 100
                    )
                    : 0;


            const lastAttended =
                lastAttendedDate
                    ? lastAttendedDate
                        .toLocaleDateString(
                            "en-US",
                            {
                                month:
                                    "long",

                                day:
                                    "numeric",

                                year:
                                    "numeric"
                            }
                        )

                    : "No attendance yet";


            return {

                id:
                    member.id,

                name:
                    member.name || "",

                status:
                    member.status || "",

                ministry:
                    member.ministry || "",

                ministries:
                    Array.isArray(
                        member.ministries
                    )
                        ? member.ministries
                        : [],


                sundayPresent,
                totalSundayServices,
                sundayRate,


                midweekPresent,
                totalMidweekServices,
                midweekRate,


                totalPresent,
                totalServices,
                overallRate,


                lastAttended,

                lastAttendedRaw:
                    lastAttendedDate
                        ? lastAttendedDate
                            .toISOString()
                            .split("T")[0]
                        : null

            };

        });


    return analytics;

}


/* =========================================
   MEMBER ATTENDANCE ANALYTICS UI
   STEP 4B
========================================= */

function renderMemberAttendanceAnalytics(
    searchText = ""
) {

    const container =
        document.getElementById(
            "attendanceAnalyticsGrid"
        );

    if (!container) {
        return;
    }


    const analytics =
        calculateMemberAttendanceAnalytics();


    const search =
    String(searchText || "")
        .trim()
        .toLowerCase();


// =====================================
// NO SEARCH = SHOW NOTHING
// =====================================

if (!search) {

    container.innerHTML = `
        <div class="attendance-analytics-empty">
            Search for a member to view attendance analytics.
        </div>
    `;

    return;
}


// =====================================
// SEARCH MEMBER
// =====================================

let filtered =
    analytics.filter(member => {

        const memberName =
            String(member.name || "")
                .toLowerCase();

        return memberName.includes(search);

    });


// =====================================
// SHOW ONLY ONE RESULT
// =====================================

filtered = filtered.slice(0, 1);


    container.innerHTML = "";


if (filtered.length === 0) {

    container.innerHTML = `
        <div class="attendance-analytics-empty">
            No member found.
        </div>
    `;

    return;
}


    filtered.forEach(member => {

        let attendanceLevel =
            "No Attendance";

        let levelClass =
            "analytics-none";


        if (member.totalServices > 0) {

            if (
                member.overallRate >= 80
            ) {

                attendanceLevel =
                    "Excellent";

                levelClass =
                    "analytics-excellent";

            } else if (
                member.overallRate >= 60
            ) {

                attendanceLevel =
                    "Good";

                levelClass =
                    "analytics-good";

            } else if (
                member.overallRate >= 40
            ) {

                attendanceLevel =
                    "Needs Attention";

                levelClass =
                    "analytics-warning";

            } else {

                attendanceLevel =
                    "Low Attendance";

                levelClass =
                    "analytics-low";

            }

        }


        const ministries =
            Array.isArray(
                member.ministries
            ) &&
            member.ministries.length > 0

                ? member.ministries

                : (
                    member.ministry
                        ? [
                            member.ministry
                        ]
                        : []
                );


        const ministryText =
            ministries.length > 0
                ? ministries.join(", ")
                : "No Ministry";


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "attendance-analytics-card";


        card.innerHTML = `

            <div class="analytics-member-header">

                <div>

                    <h4>
                        ${member.name}
                    </h4>

                    <p>
                        ${ministryText}
                    </p>

                </div>


                <span
                    class="
                        analytics-status
                        ${levelClass}
                    "
                >
                    ${attendanceLevel}
                </span>

            </div>


            <div class="analytics-overall">

                <div>

                    <span class="analytics-label">
                        Overall Attendance
                    </span>

                    <strong>
                        ${member.overallRate}%
                    </strong>

                </div>


                <div class="analytics-progress">

                    <div
                        class="
                            analytics-progress-fill
                        "
                        style="
                            width:
                            ${Math.min(
                                member.overallRate,
                                100
                            )}%;
                        "
                    ></div>

                </div>

            </div>


            <div class="analytics-stats">

                <div class="analytics-stat">

                    <span>
                        Sunday
                    </span>

                    <strong>
                        ${member.sundayPresent}
                        /
                        ${member.totalSundayServices}
                    </strong>

                    <small>
                        ${member.sundayRate}%
                    </small>

                </div>


                <div class="analytics-stat">

                    <span>
                        Midweek
                    </span>

                    <strong>
                        ${member.midweekPresent}
                        /
                        ${member.totalMidweekServices}
                    </strong>

                    <small>
                        ${member.midweekRate}%
                    </small>

                </div>


                <div class="analytics-stat">

                    <span>
                        Total
                    </span>

                    <strong>
                        ${member.totalPresent}
                        /
                        ${member.totalServices}
                    </strong>

                    <small>
                        Present
                    </small>

                </div>

            </div>


            <div class="analytics-last-attended">

                <span>
                    Last Attended
                </span>

                <strong>
                    ${member.lastAttended}
                </strong>

            </div>

        `;


        container.appendChild(
            card
        );

    });

}


/* =========================================
   ATTENDANCE ANALYTICS SEARCH
========================================= */

const attendanceAnalyticsSearch =
    document.getElementById(
        "attendanceAnalyticsSearch"
    );


if (attendanceAnalyticsSearch) {

    attendanceAnalyticsSearch
        .addEventListener(
            "input",
            function () {

                renderMemberAttendanceAnalytics(
                    this.value
                );

            }
        );

}



function renderAttendanceSummary(searchText = "") {

    let selectedAttendanceYear = new Date().getFullYear();

    const body =
        document.getElementById("attendanceSummaryBody");

    if (!body) return;

    const summaries =
        calculateMemberAttendanceSummary();

    const search =
        searchText.trim().toLowerCase();

    const filtered =
        summaries.filter(member =>
            member.name.toLowerCase().includes(search)
        );

    body.innerHTML = "";

    if (filtered.length === 0) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    style="
                        padding:20px;
                        text-align:center;
                        color:#6b7280;
                    "
                >
                    No members found.
                </td>
            </tr>
        `;

        return;
    }

    // SHOW ONLY 5 MEMBERS
    const visibleMembers = filtered.slice(0, 5);

    visibleMembers.forEach(member => {

        const tr = document.createElement("tr");

        tr.style.borderBottom =
            "1px solid #f1f5f9";

        tr.innerHTML = `
            <td style="padding:12px;">
                <b>${member.name}</b>
            </td>

            <td
                style="
                    padding:12px;
                    text-align:center;
                "
            >
                ${member.sundayPresent}
            </td>

            <td
                style="
                    padding:12px;
                    text-align:center;
                "
            >
                ${member.midweekPresent}
            </td>

            <td
                style="
                    padding:12px;
                    text-align:center;
                    font-weight:bold;
                "
            >
                ${member.totalPresent}
            </td>
        `;

        body.appendChild(tr);

    });

}

function loadAttendanceYearSelector(){

    const select =
        document.getElementById(
            "attendanceYearSelect"
        );

    if(!select) return;


    const currentYear =
        new Date().getFullYear();


    select.innerHTML = "";


    for(let year = currentYear; year >= currentYear - 5; year--){

        const option =
            document.createElement("option");

        option.value = year;
        option.textContent = year;


        select.appendChild(option);

    }


    select.value =
        selectedAttendanceYear;

}

function renderAttendanceSummary(searchText = "") {

    const body =
        document.getElementById("attendanceSummaryBody");

    if (!body) return;

    const summaries =
        calculateMemberAttendanceSummary();


    const search =
        searchText.trim().toLowerCase();

    const filtered =
        summaries.filter(member =>
            member.name.toLowerCase().includes(search)
        );

    body.innerHTML = "";

    if (filtered.length === 0) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    style="
                        padding:20px;
                        text-align:center;
                        color:#6b7280;
                    "
                >
                    No members found.
                </td>
            </tr>
        `;

        return;
    }

    filtered.forEach(member => {

        const tr = document.createElement("tr");

        tr.style.borderBottom =
            "1px solid #f1f5f9";

        tr.innerHTML = `
            <td style="padding:12px;">
                <b>${member.name}</b>
            </td>

            <td
                style="
                    padding:12px;
                    text-align:center;
                "
            >
                ${member.sundayPresent}
            </td>

            <td
                style="
                    padding:12px;
                    text-align:center;
                "
            >
                ${member.midweekPresent}
            </td>

            <td
                style="
                    padding:12px;
                    text-align:center;
                    font-weight:bold;
                "
            >
                ${member.totalPresent}
            </td>
        `;

        body.appendChild(tr);

    });
}

/* =========================================
   MEMBER STATUS ALERTS
   STEP 5A
========================================= */

function calculateMemberStatusAlerts() {

    const analytics =
        calculateMemberAttendanceAnalytics();

    const alerts = [];

    const today = new Date();

    analytics.forEach(member => {

        const originalMember =
            members.find(
                m => m.id == member.id
            );

        if (!originalMember) {
            return;
        }


        // =====================================
        // NO ATTENDANCE
        // =====================================

        if (
            member.totalServices > 0 &&
            member.totalPresent === 0
        ) {

            alerts.push({
                memberId: member.id,
                memberName: member.name,
                type: "no-attendance",
                level: "warning",
                message:
                    `No attendance recorded for ${selectedAttendanceYear}.`
            });

        }


        // =====================================
        // LOW ATTENDANCE
        // =====================================

        else if (
            member.totalServices > 0 &&
            member.overallRate < 40
        ) {

            alerts.push({
                memberId: member.id,
                memberName: member.name,
                type: "low-attendance",
                level: "warning",
                message:
                    `Attendance is only ${member.overallRate}% for ${selectedAttendanceYear}.`
            });

        }


        // =====================================
        // INACTIVE MEMBER
        // =====================================

        const status =
            String(
                originalMember.status || ""
            )
                .trim()
                .toLowerCase();

        if (status === "inactive") {

            alerts.push({
                memberId: member.id,
                memberName: member.name,
                type: "inactive",
                level: "info",
                message:
                    "Member is currently marked as inactive."
            });

        }


        // =====================================
        // MISSING CONTACT
        // =====================================

        const contact =
            String(
                originalMember.contact || ""
            )
                .trim()
                .toLowerCase();

        if (
            !contact ||
            contact === "no contact" ||
            contact === "n/a"
        ) {

            alerts.push({
                memberId: member.id,
                memberName: member.name,
                type: "missing-contact",
                level: "info",
                message:
                    "No contact number recorded."
            });

        }


        // =====================================
        // NO MINISTRY
        // =====================================

        const ministries =
            Array.isArray(
                originalMember.ministries
            )
                ? originalMember.ministries
                    .filter(Boolean)
                : [];


        const primaryMinistry =
            String(
                originalMember.ministry || ""
            ).trim();


        if (
            ministries.length === 0 &&
            !primaryMinistry
        ) {

            alerts.push({
                memberId: member.id,
                memberName: member.name,
                type: "no-ministry",
                level: "info",
                message:
                    "No ministry assigned."
            });

        }


        // =====================================
        // BIRTHDAY THIS WEEK
        // =====================================

        if (originalMember.birthday) {

            const birthday =
                new Date(
                    originalMember.birthday
                );


            if (
                !isNaN(
                    birthday.getTime()
                )
            ) {

                const birthdayThisYear =
                    new Date(
                        today.getFullYear(),
                        birthday.getMonth(),
                        birthday.getDate()
                    );


                // If birthday already passed,
                // check next year
                if (
                    birthdayThisYear <
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate()
                    )
                ) {

                    birthdayThisYear
                        .setFullYear(
                            today.getFullYear() + 1
                        );

                }


                const todayOnly =
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate()
                    );


                const diffTime =
                    birthdayThisYear -
                    todayOnly;


                const daysUntilBirthday =
                    Math.round(
                        diffTime /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    );


                if (
                    daysUntilBirthday >= 0 &&
                    daysUntilBirthday <= 7
                ) {

                    let birthdayMessage;

                    if (
                        daysUntilBirthday === 0
                    ) {

                        birthdayMessage =
                            "Birthday today! 🎂";

                    } else {

                        birthdayMessage =
                            `Birthday in ${daysUntilBirthday} day${daysUntilBirthday === 1 ? "" : "s"}.`;

                    }


                    alerts.push({
                        memberId: member.id,
                        memberName: member.name,
                        type: "birthday",
                        level: "birthday",
                        message:
                            birthdayMessage
                    });

                }

            }

        }

    });


    return alerts;

}



/* =========================================
   MEMBER STATUS ALERTS UI
   STEP 5B
========================================= */

function renderMemberStatusAlerts() {

    const container =
        document.getElementById(
            "memberStatusAlertsList"
        );

    const countEl =
        document.getElementById(
            "memberAlertCount"
        );

    if (!container) {
        return;
    }


    const alerts =
        calculateMemberStatusAlerts();


    if (countEl) {
        countEl.textContent =
            alerts.length;
    }


container.innerHTML = "";

if (alerts.length === 0) {

    container.innerHTML = `
        <div class="member-alert-all-good">

            <div class="member-alert-good-icon">
                ✓
            </div>

            <div class="member-alert-good-content">

                <strong>
                    All Members Look Good
                </strong>

                <span>
                    No member status alerts require attention at this time.
                </span>

            </div>

        </div>
    `;

    return;
}

    const visibleAlerts =
        alerts.slice(0, 5);


    visibleAlerts.forEach(alert => {

        let icon = "ℹ️";
        let className = "member-alert-info";


        if (
            alert.level === "warning"
        ) {

            icon = "⚠️";
            className =
                "member-alert-warning";

        }


        if (
            alert.level === "birthday"
        ) {

            icon = "🎂";
            className =
                "member-alert-birthday";

        }


        const item =
            document.createElement("div");


        item.className =
            `member-alert-item ${className}`;


        item.innerHTML = `

            <div class="member-alert-icon">
                ${icon}
            </div>

            <div class="member-alert-content">

                <strong>
                    ${alert.memberName}
                </strong>

                <span>
                    ${alert.message}
                </span>

            </div>

        `;


        container.appendChild(
            item
        );

    });

}

/* =========================================
   MINISTRY DASHBOARD ENGINE
   STEP 6A
========================================= */

function getAvailableMinistries() {

    const ministrySet = new Set();


    members.forEach(member => {

        // Multiple ministries
        if (Array.isArray(member.ministries)) {

            member.ministries.forEach(ministry => {

                const name =
                    String(ministry || "").trim();

                if (name) {
                    ministrySet.add(name);
                }

            });

        }


        // Legacy / primary ministry
        const primaryMinistry =
            String(
                member.ministry || ""
            ).trim();


        if (primaryMinistry) {
            ministrySet.add(primaryMinistry);
        }

    });


    return Array.from(ministrySet)
        .sort((a, b) =>
            a.localeCompare(
                b,
                undefined,
                {
                    sensitivity: "base"
                }
            )
        );

}

/* =========================================
   MINISTRY DASHBOARD UI
   STEP 6B
========================================= */

function populateMinistryDashboardSelect() {

    const select =
        document.getElementById(
            "ministryDashboardSelect"
        );

    if (!select) return;


    const ministries =
        getAvailableMinistries();


    select.innerHTML = `
        <option value="">
            Select Ministry
        </option>
    `;


    ministries.forEach(ministry => {

        const option =
            document.createElement("option");

        option.value =
            ministry;

        option.textContent =
            ministry;

        select.appendChild(
            option
        );

    });

}


function renderMinistryDashboard(
    ministryName
) {

    const container =
        document.getElementById(
            "ministryDashboardContent"
        );

    if (!container) return;


    if (!ministryName) {

        container.innerHTML = `
            <div class="ministry-dashboard-empty">
                Select a ministry to view details.
            </div>
        `;

        return;
    }


    const data =
        calculateMinistryDashboard(
            ministryName
        );


    if (!data) {
        return;
    }


    let membersHTML = "";


    if (data.members.length === 0) {

        membersHTML = `
            <div class="ministry-dashboard-empty">
                No members found.
            </div>
        `;

    } else {

        data.members.forEach(member => {

            const status =
                member.status ||
                "Active";

            membersHTML += `

                <div class="ministry-member-row">

                    <div>

                        <strong>
                            ${member.name || ""}
                        </strong>

                        <span>
                            ${member.role || "Member"}
                        </span>

                    </div>

                    <span class="ministry-member-status">
                        ${status}
                    </span>

                </div>

            `;

        });

    }


    container.innerHTML = `

        <div class="ministry-dashboard-title">

            <h4>
                ${data.ministry}
            </h4>

            <span>
                ${selectedAttendanceYear}
            </span>

        </div>


        <div class="ministry-stat-grid">

            <div class="ministry-stat-box">

                <span>
                    Total Members
                </span>

                <strong>
                    ${data.totalMembers}
                </strong>

            </div>


            <div class="ministry-stat-box">

                <span>
                    Active Members
                </span>

                <strong>
                    ${data.activeMembers}
                </strong>

            </div>


            <div class="ministry-stat-box">

                <span>
                    Leaders
                </span>

                <strong>
                    ${data.leaders}
                </strong>

            </div>

        </div>


        <div class="ministry-attendance-section">

            <h5>
                Attendance
            </h5>


            <div class="ministry-attendance-grid">

                <div class="ministry-attendance-box">

                    <span>
                        Sunday
                    </span>

                    <strong>
                        ${data.attendance.sundayRate}%
                    </strong>

                    <small>
                        ${data.attendance.sundayPresent}
                        /
                        ${data.attendance.sundayPossible}
                    </small>

                </div>


                <div class="ministry-attendance-box">

                    <span>
                        Midweek
                    </span>

                    <strong>
                        ${data.attendance.midweekRate}%
                    </strong>

                    <small>
                        ${data.attendance.midweekPresent}
                        /
                        ${data.attendance.midweekPossible}
                    </small>

                </div>


                <div class="ministry-attendance-box">

                    <span>
                        Overall
                    </span>

                    <strong>
                        ${data.attendance.overallRate}%
                    </strong>

                    <small>
                        ${data.attendance.totalPresent}
                        /
                        ${data.attendance.totalPossible}
                    </small>

                </div>

            </div>

        </div>


        <div class="ministry-members-section">

            <h5>
                Members
            </h5>

            <div class="ministry-members-list">
                ${membersHTML}
            </div>

        </div>

    `;

}

const ministryDashboardSelect =
    document.getElementById(
        "ministryDashboardSelect"
    );


if (ministryDashboardSelect) {

    ministryDashboardSelect
        .addEventListener(
            "change",
            function () {

                renderMinistryDashboard(
                    this.value
                );

            }
        );

}


/* =========================================
   CALCULATE MINISTRY DASHBOARD
========================================= */

function calculateMinistryDashboard(
    selectedMinistry
) {

    const ministryName =
        String(
            selectedMinistry || ""
        ).trim();


    if (!ministryName) {
        return null;
    }


    const normalizedMinistry =
        ministryName.toLowerCase();


    // =====================================
    // MEMBERS OF SELECTED MINISTRY
    // =====================================

    const ministryMembers =
        members.filter(member => {

            const memberMinistries = [];


            if (
                Array.isArray(
                    member.ministries
                )
            ) {

                member.ministries
                    .forEach(ministry => {

                        const name =
                            String(
                                ministry || ""
                            )
                                .trim()
                                .toLowerCase();

                        if (name) {
                            memberMinistries.push(
                                name
                            );
                        }

                    });

            }


            const primary =
                String(
                    member.ministry || ""
                )
                    .trim()
                    .toLowerCase();


            if (primary) {
                memberMinistries.push(
                    primary
                );
            }


            return memberMinistries.includes(
                normalizedMinistry
            );

        });


    // =====================================
    // ACTIVE MEMBERS
    // =====================================

    const activeMembers =
        ministryMembers.filter(member => {

            const status =
                String(
                    member.status || ""
                )
                    .trim()
                    .toLowerCase();

            return status !== "inactive";

        });


    // =====================================
    // LEADERS
    // =====================================

    const leaders =
        ministryMembers.filter(member => {

            const role =
                String(
                    member.role || ""
                )
                    .trim()
                    .toLowerCase();

            return (
                role.includes("leader") ||
                role.includes("head") ||
                role.includes("pastor")
            );

        });


    // =====================================
    // ATTENDANCE ANALYTICS
    // =====================================

    const attendanceAnalytics =
        calculateMemberAttendanceAnalytics();


    const memberIds =
        new Set(
            ministryMembers.map(member =>
                String(member.id)
            )
        );


    const ministryAnalytics =
        attendanceAnalytics.filter(
            analytics =>
                memberIds.has(
                    String(analytics.id)
                )
        );


    // =====================================
    // ATTENDANCE TOTALS
    // =====================================

    let sundayPresent = 0;
    let sundayPossible = 0;

    let midweekPresent = 0;
    let midweekPossible = 0;


    ministryAnalytics.forEach(member => {

        sundayPresent +=
            member.sundayPresent || 0;

        sundayPossible +=
            member.totalSundayServices || 0;


        midweekPresent +=
            member.midweekPresent || 0;

        midweekPossible +=
            member.totalMidweekServices || 0;

    });


    const totalPresent =
        sundayPresent +
        midweekPresent;


    const totalPossible =
        sundayPossible +
        midweekPossible;


    // =====================================
    // ATTENDANCE RATES
    // =====================================

    const sundayRate =
        sundayPossible > 0
            ? Math.round(
                (
                    sundayPresent /
                    sundayPossible
                ) * 100
            )
            : 0;


    const midweekRate =
        midweekPossible > 0
            ? Math.round(
                (
                    midweekPresent /
                    midweekPossible
                ) * 100
            )
            : 0;


    const overallRate =
        totalPossible > 0
            ? Math.round(
                (
                    totalPresent /
                    totalPossible
                ) * 100
            )
            : 0;


    // =====================================
    // SORT MEMBER LIST
    // =====================================

    const sortedMembers =
        [...ministryMembers]
            .sort((a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    )
            );


    return {

        ministry:
            ministryName,

        totalMembers:
            ministryMembers.length,

        activeMembers:
            activeMembers.length,

        leaders:
            leaders.length,


        attendance: {

            sundayPresent,
            sundayPossible,
            sundayRate,

            midweekPresent,
            midweekPossible,
            midweekRate,

            totalPresent,
            totalPossible,
            overallRate

        },


        members:
            sortedMembers

    };

}

// =====================================
// ATTENDANCE - UI & LOCALSTORAGE DELETE WRAPPER
// =====================================

async function deleteAttendance(date, serviceType) {

    if (!requireAdmin()) {
        return;
    }

    if (!confirm(
        `Are you sure you want to delete the attendance record for ${date}?`
    )) {
        return;
    }

    const actualServiceType = serviceType || "sunday";

    const deletedFromSupabase =
        await deleteAttendanceFromSupabase(
            date,
            actualServiceType
        );

    if (!deletedFromSupabase) {
        alert(
            "❌ Failed to delete the attendance record in Supabase."
        );
        return;
    }

    attendanceRecords = attendanceRecords.filter(record =>
        !(
            record.date === date &&
            (record.serviceType || "sunday") === actualServiceType
        )
    );

    localStorage.setItem(
        "churchhq_attendance",
        JSON.stringify(attendanceRecords)
    );

    renderAttendanceHistory();
    loadAttendanceForDate();

    alert(
        `✅ ${actualServiceType === "midweek" ? "Midweek" : "Sunday"} attendance from ${date} is successfully deleted.`
    );
}

async function deleteAttendanceFromSupabase(date, serviceType) {
    try {

        const actualServiceType = serviceType || "sunday";

        const { data, error } = await churchSupabase
            .from("attendance_records")
            .delete()
            .eq("date", date)
            .eq("service_type", actualServiceType)
            .select();

        if (error) {
            console.error(
                "❌ Failed to delete attendance from Supabase:",
                error
            );

            return false;
        }

        // Walang record na aktuwal na nabura
        if (!data || data.length === 0) {
            console.error(
                "❌ No attendance record was deleted.",
                {
                    date,
                    serviceType: actualServiceType
                }
            );

            return false;
        }

        console.log(
            "✅ Attendance deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Attendance Supabase delete error:",
            error
        );

        return false;
    }
}
// =====================================
// ATTENDANCE HISTORY RENDER
// =====================================

function renderAttendanceHistory() {

    const body =
        document.getElementById("attendanceHistoryBody");

    if (!body) return;

    body.innerHTML = "";

    if (attendanceRecords.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="5"
                    style="padding: 20px; text-align: center; color: #9ca3af;">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }

    const sortedRecords =
        [...attendanceRecords].sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );

    sortedRecords.forEach(record => {

        const tr =
            document.createElement("tr");

        tr.style.borderBottom =
            "1px solid #f1f5f9";

        tr.innerHTML = `

            <td style="padding: 10px;">
                <b>${record.date}</b>
            </td>

            <td style="padding: 10px;">
                ${record.eventName || "-"}
            </td>

            <td style="padding: 10px; text-align: center;">
                ${record.totalMembers || 0}
            </td>

            <td style="padding: 10px; text-align: center;">
                ${record.presentCount || 0}
            </td>

            <td style="padding: 10px; text-align: center;">

                <button
    type="button"
    class="secondary-btn"
    data-admin-only="true"
    style="padding: 4px 8px; font-size: 12px;"
    onclick="loadAttendanceRecord('${record.date}', '${record.serviceType || "sunday"}')">
    ✏️ Load
</button>

<button
    type="button"
    class="secondary-btn"
    data-admin-only="true"
    style="padding: 4px 8px; font-size: 12px; color:#ef4444; border-color:#fca5a5;"
    onclick="deleteAttendance('${record.date}', '${record.serviceType || "sunday"}')">
    ✖ Delete
</button>

            </td>
        `;

        body.appendChild(tr);
    });
}

// =====================================
// LOAD ATTENDANCE RECORD
// =====================================

function loadAttendanceRecord(date, serviceType) {

    if (!requireAdmin()) {
        return;
    }

    const actualServiceType =
        serviceType || "sunday";

    const record = attendanceRecords.find(
        r =>
            r.date === date &&
            (r.serviceType || "sunday") === actualServiceType
    );

    if (!record) return;

    if (attDateInput) {
        attDateInput.value = record.date || "";
    }

    if (attServiceType) {
        attServiceType.value = actualServiceType;
    }

    const eventNameEl =
        document.getElementById("attEventName");

    if (eventNameEl) {
        eventNameEl.value =
            record.eventName ||
            (
                actualServiceType === "midweek"
                    ? "Midweek Service"
                    : "Sunday General Service"
            );
    }

    currentCheckIns = {
        ...(record.checkIns || {})
    };

    renderAttendanceList();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================
   SETTINGS & BACKUP ENGINE
   SUPABASE EXPORT BACKUP
========================================= */

async function exportChurchData() {

    if (!requireAdmin()) {
        return;
    }

    try {

        console.log("📦 Creating Supabase backup...");


        const [
            membersResult,
            tasksResult,
            songsResult,
            servicesResult,
            attendanceResult,
            activitiesResult,
            announcementsResult
        ] = await Promise.all([

            churchSupabase
                .from("members")
                .select("*"),

            churchSupabase
                .from("planner_tasks")
                .select("*"),

            churchSupabase
                .from("songs")
                .select("*"),

            churchSupabase
                .from("service_records")
                .select("*"),

            churchSupabase
                .from("attendance_records")
                .select("*"),

            churchSupabase
                .from("activities")
                .select("*"),

            churchSupabase
                .from("announcements")
                .select("*")

        ]);


        const results = [
            ["members", membersResult],
            ["planner_tasks", tasksResult],
            ["songs", songsResult],
            ["service_records", servicesResult],
            ["attendance_records", attendanceResult],
            ["activities", activitiesResult],
            ["announcements", announcementsResult]
        ];


        // Check Supabase errors
        for (const [tableName, result] of results) {

            if (result.error) {

                console.error(
                    `❌ Failed to export ${tableName}:`,
                    result.error
                );

                alert(
                    `❌ Backup failed while reading ${tableName}.`
                );

                return;
            }

        }


        const backupData = {

            app: "ChurchHQ",

            version: "3.0",

            source: "Supabase",

            exportDate:
                new Date().toISOString(),

            data: {

                members:
                    membersResult.data || [],

                planner_tasks:
                    tasksResult.data || [],

                songs:
                    songsResult.data || [],

                service_records:
                    servicesResult.data || [],

                attendance_records:
                    attendanceResult.data || [],

                activities:
                    activitiesResult.data || [],

                announcements:
                    announcementsResult.data || []

            }

        };


        // Convert backup to JSON
        const jsonData =
            JSON.stringify(
                backupData,
                null,
                2
            );


        const blob =
            new Blob(
                [jsonData],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const downloadAnchor =
            document.createElement("a");


        const today =
            new Date()
                .toISOString()
                .slice(0, 10);


        downloadAnchor.href =
            url;

        downloadAnchor.download =
            `churchhq_supabase_backup_${today}.json`;


        document.body.appendChild(
            downloadAnchor
        );


        downloadAnchor.click();


        downloadAnchor.remove();

        URL.revokeObjectURL(url);


        console.log(
            "✅ Supabase backup created:",
            {
                members:
                    backupData.data.members.length,

                planner_tasks:
                    backupData.data.planner_tasks.length,

                songs:
                    backupData.data.songs.length,

                service_records:
                    backupData.data.service_records.length,

                attendance_records:
                    backupData.data.attendance_records.length,

                activities:
                    backupData.data.activities.length,

                announcements:
                    backupData.data.announcements.length
            }
        );

        const backupTime =
    new Date().toISOString();

localStorage.setItem(
    "churchhq_last_backup",
    backupTime
);

updateLastBackupDisplay();

        alert(
            "✅ Supabase backup downloaded successfully!"
        );


    } catch (error) {

        console.error(
            "❌ Supabase backup error:",
            error
        );

        alert(
            "❌ Failed to create Supabase backup."
        );

    }

}

/* =========================================
   SETTINGS & BACKUP ENGINE
   SUPABASE IMPORT / RESTORE
========================================= */

async function importChurchData(event) {

    if (!requireAdmin()) {
        return;
    }

    const file = event.target.files[0];

    if (!file) return;


    const reader = new FileReader();


    reader.onload = async function(e) {

        try {

            const importedJSON =
                JSON.parse(e.target.result);


            // =====================================
            // VALIDATE BACKUP FORMAT
            // =====================================

            if (
                !importedJSON ||
                importedJSON.app !== "ChurchHQ" ||
                !importedJSON.data
            ) {

                alert(
                    "❌ Invalid ChurchHQ backup file."
                );

                event.target.value = "";

                return;
            }


            const backup =
                importedJSON.data;


            const validSupabaseBackup =
                Array.isArray(backup.members) &&
                Array.isArray(backup.planner_tasks) &&
                Array.isArray(backup.songs) &&
                Array.isArray(backup.service_records) &&
                Array.isArray(backup.attendance_records) &&
                Array.isArray(backup.activities) &&
                Array.isArray(backup.announcements);


            if (!validSupabaseBackup) {

                alert(
                    "❌ This is not a valid Supabase ChurchHQ backup."
                );

                event.target.value = "";

                return;
            }


            const confirmed = confirm(
                "⚠️ Restore this backup to the ChurchHQ Supabase database?\n\n" +
                "Existing records with the same IDs will be updated.\n" +
                "New records will be added.\n\n" +
                "Continue?"
            );


            if (!confirmed) {

                event.target.value = "";

                return;
            }


            console.log(
                "📤 Starting Supabase restore..."
            );


            // =====================================
            // RESTORE MEMBERS
            // =====================================

            if (backup.members.length > 0) {

                const {
                    error: membersError
                } = await churchSupabase
                    .from("members")
                    .upsert(
                        backup.members,
                        {
                            onConflict: "id"
                        }
                    );

                if (membersError) {
                    throw new Error(
                        "Members restore failed: " +
                        membersError.message
                    );
                }

            }


            // =====================================
            // RESTORE PLANNER TASKS
            // =====================================

            if (backup.planner_tasks.length > 0) {

                const {
                    error: tasksError
                } = await churchSupabase
                    .from("planner_tasks")
                    .upsert(
                        backup.planner_tasks,
                        {
                            onConflict: "id"
                        }
                    );

                if (tasksError) {
                    throw new Error(
                        "Planner tasks restore failed: " +
                        tasksError.message
                    );
                }

            }


            // =====================================
            // RESTORE SONGS
            // =====================================

            if (backup.songs.length > 0) {

                const {
                    error: songsError
                } = await churchSupabase
                    .from("songs")
                    .upsert(
                        backup.songs,
                        {
                            onConflict: "id"
                        }
                    );

                if (songsError) {
                    throw new Error(
                        "Songs restore failed: " +
                        songsError.message
                    );
                }

            }


            // =====================================
            // RESTORE SERVICE RECORDS
            // =====================================

            if (backup.service_records.length > 0) {

                const {
                    error: servicesError
                } = await churchSupabase
                    .from("service_records")
                    .upsert(
                        backup.service_records,
                        {
                            onConflict: "id"
                        }
                    );

                if (servicesError) {
                    throw new Error(
                        "Service records restore failed: " +
                        servicesError.message
                    );
                }

            }


            // =====================================
            // RESTORE ATTENDANCE
            // =====================================

            if (backup.attendance_records.length > 0) {

                const {
                    error: attendanceError
                } = await churchSupabase
                    .from("attendance_records")
                    .upsert(
                        backup.attendance_records,
                        {
                            onConflict: "id"
                        }
                    );

                if (attendanceError) {
                    throw new Error(
                        "Attendance restore failed: " +
                        attendanceError.message
                    );
                }

            }


            // =====================================
            // RESTORE ACTIVITIES
            // =====================================

            if (backup.activities.length > 0) {

                const {
                    error: activitiesError
                } = await churchSupabase
                    .from("activities")
                    .upsert(
                        backup.activities,
                        {
                            onConflict: "id"
                        }
                    );

                if (activitiesError) {
                    throw new Error(
                        "Activities restore failed: " +
                        activitiesError.message
                    );
                }

            }


            // =====================================
            // RESTORE ANNOUNCEMENTS
            // =====================================

            if (backup.announcements.length > 0) {

                const {
                    error: announcementsError
                } = await churchSupabase
                    .from("announcements")
                    .upsert(
                        backup.announcements,
                        {
                            onConflict: "id"
                        }
                    );

                if (announcementsError) {
                    throw new Error(
                        "Announcements restore failed: " +
                        announcementsError.message
                    );
                }

            }


            console.log(
                "✅ Supabase restore completed successfully."
            );


            alert(
                "✅ ChurchHQ backup restored to Supabase successfully!"
            );


            event.target.value = "";


            // Reload latest data from Supabase
            await initializeChurchHQ();


        } catch (error) {

            console.error(
                "❌ Supabase restore error:",
                error
            );


            alert(
                "❌ Restore failed:\n\n" +
                error.message
            );


            event.target.value = "";

        }

    };


    reader.readAsText(file);

}

/* =========================================
   BACKUP DATE STATUS
========================================= */

function updateLastBackupDisplay() {

    const display =
        document.getElementById("lastBackupDate");

    if (!display) return;


    const savedDate =
        localStorage.getItem(
            "churchhq_last_backup"
        );


    if (!savedDate) {

        display.textContent =
            "No backup recorded yet";

        return;

    }


    const date =
        new Date(savedDate);


    display.textContent =
        date.toLocaleString();

}

/* =========================================
   CLEAR ALL CHURCH DATA
   SUPABASE DATABASE RESET
========================================= */

async function clearAllChurchData() {

    if (!requireAdmin()) {
        return;
    }

    const firstConfirm = confirm(
        "🚨 WARNING!\n\n" +
        "This will permanently delete ALL ChurchHQ records from the Supabase database.\n\n" +
        "This includes:\n" +
        "• Members\n" +
        "• Planner Tasks\n" +
        "• Songs\n" +
        "• Sunday & Midweek Services\n" +
        "• Attendance\n" +
        "• Activities\n" +
        "• Announcements\n\n" +
        "Your login account will NOT be deleted.\n\n" +
        "Continue?"
    );

    if (!firstConfirm) {
        return;
    }


    const secondConfirm = confirm(
        "⚠️ FINAL WARNING\n\n" +
        "This action cannot be undone unless you have a backup.\n\n" +
        "Are you absolutely sure?"
    );

    if (!secondConfirm) {
        return;
    }


    const confirmationText = prompt(
        'Type DELETE ALL DATA to confirm:'
    );

    if (confirmationText !== "DELETE ALL DATA") {

        alert(
            "❌ Database reset cancelled."
        );

        return;
    }


    try {

        console.log(
            "🗑️ Clearing ChurchHQ Supabase database..."
        );


        const tables = [

            "attendance_records",
            "service_records",
            "planner_tasks",
            "songs",
            "activities",
            "announcements",
            "members"

        ];


        for (const tableName of tables) {

            console.log(
                `Deleting ${tableName}...`
            );


            const { error } =
                await churchSupabase
                    .from(tableName)
                    .delete()
                    .not("id", "is", null);


            if (error) {

                console.error(
                    `❌ Failed to clear ${tableName}:`,
                    error
                );

                throw new Error(
                    `Failed to clear ${tableName}: ${error.message}`
                );
            }


            console.log(
                `✅ Cleared ${tableName}`
            );
        }


        // Clear only ChurchHQ cache
        const localKeys = [

            "churchhq_tasks",
            "churchhq_songs",
            "churchhq_members",
            "churchhq_attendance",
            "churchhq_activities",
            "churchhq_announcements",
            "churchhq_sunday_services",
            "churchhq_midweek_services",
            "churchhq_sunday_lineup"

        ];


        localKeys.forEach(key => {
            localStorage.removeItem(key);
        });


        console.log(
            "✅ ChurchHQ local cache cleared."
        );


        alert(
            "✅ ChurchHQ database has been completely cleared.\n\n" +
            "Your login account was not deleted."
        );


        location.reload();


    } catch (error) {

        console.error(
            "❌ Database reset failed:",
            error
        );


        alert(
            "❌ Database reset failed.\n\n" +
            error.message +
            "\n\nSome tables may not have been cleared."
        );
    }
}

/* =========================================
   REPORTS & ANALYTICS ENGINE
   SUPABASE SOURCE OF TRUTH
========================================= */

async function generateReportsData() {

    try {

        console.log("📊 Loading Reports from Supabase...");

        // =====================================
        // LOAD MEMBERS
        // =====================================

        const {
            data: membersData,
            error: membersError
        } = await churchSupabase
            .from("members")
            .select("*");

        if (membersError) {
            throw membersError;
        }


        // =====================================
        // LOAD SONGS
        // =====================================

        const {
            data: songsData,
            error: songsError
        } = await churchSupabase
            .from("songs")
            .select("*");

        if (songsError) {
            throw songsError;
        }


        // =====================================
        // LOAD TASKS
        // =====================================

        const {
            data: tasksData,
            error: tasksError
        } = await churchSupabase
            .from("planner_tasks")
            .select("*");

        if (tasksError) {
            throw tasksError;
        }


        // =====================================
        // LOAD ATTENDANCE
        // =====================================

        const {
            data: attendanceRecordsData,
            error: attendanceError
        } = await churchSupabase
            .from("attendance_records")
            .select("*")
            .order("date", {
                ascending: false
            });

        if (attendanceError) {
            throw attendanceError;
        }


        // =====================================
        // SAFE ARRAYS
        // =====================================

        const members =
            membersData || [];

        const songs =
            songsData || [];

        const tasks =
            tasksData || [];

        const attendance =
            attendanceRecordsData || [];


        // =====================================
        // MEMBERS
        // =====================================

        const totalMembers =
            members.length;

        const activeMembers =
            members.filter(member =>
                member.status === "Active" ||
                !member.status
            ).length;


        const totalMembersEl =
            document.getElementById(
                "rep-total-members"
            );

        if (totalMembersEl) {
            totalMembersEl.textContent =
                totalMembers;
        }


        const activeMembersBadge =
            document.getElementById(
                "rep-active-members-badge"
            );

        if (activeMembersBadge) {
            activeMembersBadge.textContent =
                `${activeMembers} Active Members`;
        }


        // =====================================
        // LATEST ATTENDANCE
        // =====================================

        const latestAttendance =
            attendance.length > 0
                ? attendance[0]
                : null;


        let presentCount = 0;


        if (latestAttendance) {

            if (latestAttendance.check_ins) {

                presentCount =
                    Object.values(
                        latestAttendance.check_ins
                    ).filter(Boolean).length;

            } else if (
                latestAttendance.present_count !== undefined
            ) {

                presentCount =
                    latestAttendance.present_count;

            }

        }


        const turnoutRate =
            totalMembers > 0
                ? Math.round(
                    (presentCount / totalMembers) * 100
                )
                : 0;


        const latestAttendanceEl =
            document.getElementById(
                "rep-latest-att"
            );

        if (latestAttendanceEl) {
            latestAttendanceEl.textContent =
                presentCount;
        }


        const latestAttendanceRateEl =
            document.getElementById(
                "rep-latest-att-rate"
            );

        if (latestAttendanceRateEl) {

            latestAttendanceRateEl.textContent =
                latestAttendance
                    ? `${turnoutRate}% turnout (${latestAttendance.date || "Latest"})`
                    : "No records yet";

        }


        // =====================================
        // SONGS
        // =====================================

        const totalSongsEl =
            document.getElementById(
                "rep-total-songs"
            );

        if (totalSongsEl) {
            totalSongsEl.textContent =
                songs.length;
        }


        // =====================================
        // TASKS
        // =====================================

        const totalTasks =
            tasks.length;

        const completedTasks =
            tasks.filter(task =>
                task.status === "completed" ||
                task.completed
            ).length;


        const progressRate =
            totalTasks > 0
                ? Math.round(
                    (completedTasks / totalTasks) * 100
                )
                : 0;


        const taskProgressEl =
            document.getElementById(
                "rep-task-progress"
            );

        if (taskProgressEl) {

            taskProgressEl.textContent =
                `${progressRate}%`;

        }


        const taskCountsEl =
            document.getElementById(
                "rep-task-counts"
            );

        if (taskCountsEl) {

            taskCountsEl.textContent =
                `${completedTasks} of ${totalTasks} Completed`;

        }


        // =====================================
        // MEMBERS PER MINISTRY
        // =====================================

        const ministryCounts = {};


        members.forEach(member => {

            const ministry =
                member.ministry ||
                "Unassigned";

            ministryCounts[ministry] =
                (ministryCounts[ministry] || 0) + 1;

        });


        const ministryContainer =
            document.getElementById(
                "rep-ministry-list"
            );


        if (ministryContainer) {

            ministryContainer.innerHTML = "";


            if (
                Object.keys(ministryCounts).length === 0
            ) {

                ministryContainer.innerHTML = `
                    <p style="
                        color:#9ca3af;
                        font-size:14px;
                    ">
                        No member data available.
                    </p>
                `;

            } else {

                Object.entries(
                    ministryCounts
                ).forEach(
                    ([ministry, count]) => {

                        const percentage =
                            totalMembers > 0
                                ? Math.round(
                                    (count / totalMembers) * 100
                                )
                                : 0;


                        ministryContainer.innerHTML += `
                            <div>

                                <div style="
                                    display:flex;
                                    justify-content:space-between;
                                    font-size:13px;
                                    font-weight:500;
                                    margin-bottom:4px;
                                ">

                                    <span>
                                        ${ministry}
                                    </span>

                                    <span style="
                                        color:#6b7280;
                                    ">
                                        ${count}
                                        members
                                        (${percentage}%)
                                    </span>

                                </div>

                                <div style="
                                    background-color:#e5e7eb;
                                    height:8px;
                                    border-radius:4px;
                                    overflow:hidden;
                                ">

                                    <div style="
                                        background-color:#2563eb;
                                        width:${percentage}%;
                                        height:100%;
                                        border-radius:4px;
                                    "></div>

                                </div>

                            </div>
                        `;

                    }
                );

            }

        }


        console.log(
            "✅ Reports loaded from Supabase:",
            {
                members: members.length,
                songs: songs.length,
                tasks: tasks.length,
                attendance: attendance.length
            }
        );


    } catch (error) {

        console.error(
            "❌ Failed to load Reports from Supabase:",
            error
        );

    }

}
/* =========================================
   DASHBOARD DYNAMIC ACTIVITIES & ANNOUNCEMENTS
========================================= */
let currentManageType = '';

function openActivityModal() {
    currentManageType = 'activities';
    openDashboardManageModal("Manage Upcoming Activities");
}

function openAnnouncementModal() {
    currentManageType = 'announcements';
    openDashboardManageModal("Manage Announcements");
}

function openDashboardManageModal(title) {
    const modal = document.getElementById("manageDashboardModal");
    const modalTitle = document.getElementById("manageModalTitle");
    if (modalTitle) modalTitle.textContent = title;
    if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    }

    renderManageModalContent();
}

function closeDashboardManageModal() {
    const modal = document.getElementById("manageDashboardModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
    }
    renderDashboardLists();
}

function renderManageModalContent() {
    const bodyContainer = document.getElementById("manageModalBody");
    if (!bodyContainer) return;

    if (currentManageType === 'activities') {
        let activities = [];
        try { activities = JSON.parse(localStorage.getItem("churchhq_activities")) || []; } catch(e){}
        
        activities.sort((a, b) => {
            let dateA = new Date(a.date);
            let dateB = new Date(b.date);
            return (isNaN(dateA) || isNaN(dateB)) ? 0 : dateA - dateB;
        });

        let html = `
            <div style="margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 6px;">
                <h4 style="margin: 0 0 10px 0;">Add New Activity</h4>
                <input type="text" id="newActTitle" placeholder="Title (Example: Youth Fellowship)" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                <input type="text" id="newActDate" placeholder="Date (Example: August 5, 2026)" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                <button type="button"
    class="secondary-btn"
    data-admin-only="true"
    onclick="addNewActivityItem()"
    style="background: #2563eb; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">
    ➕ Add
</button>
            </div>
            <h4 style="margin-bottom: 10px;">List of Activity/ies):</h4>
            <div style="max-height: 250px; overflow-y: auto;">
        `;

        if (activities.length === 0) {
            html += `<p style="color: #9ca3af; text-align: center;">No Activity.</p>`;
        } else {
            activities.forEach(act => {
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #e2e8f0; gap: 10px;">
                        <div>
                            <strong style="font-size: 14px;">${act.title}</strong><br>
                            <small style="color: #64748b;">📅 ${act.date}</small>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button type="button"
    data-admin-only="true"
    onclick="editActivityItem(${act.id})"
    style="background:none; border:none; color:#2563eb; cursor:pointer;"
    title="Edit">
    ✏️
</button>
                            <button type="button"
    data-admin-only="true"
    onclick="deleteActivityItem(${act.id})"
    style="background:none; border:none; color:#ef4444; cursor:pointer;"
    title="Delete">
    ❌
</button>
                    </div>
                `;
            });
        }
        html += `</div>`;
        bodyContainer.innerHTML = html;

    } else if (currentManageType === 'announcements') {
        let announcements = [];
        try { announcements = JSON.parse(localStorage.getItem("churchhq_announcements")) || []; } catch(e){}

        let html = `
            <div style="margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 6px;">
                <h4 style="margin: 0 0 10px 0;">Add New Announcement</h4>
                <input type="text" id="newAnnText" placeholder="Place announcemt here" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                <button
    type="button"
    class="secondary-btn"
    data-admin-only="true"
    onclick="addNewAnnouncementItem()"
    style="background: #2563eb; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;"
>
    ➕ Add
</button>
            </div>
            <h4 style="margin-bottom: 10px;">Announcement List</h4>
            <div style="max-height: 250px; overflow-y: auto;">
        `;

        if (announcements.length === 0) {
            html += `<p style="color: #9ca3af; text-align: center;">No Announcement.</p>`;
        } else {
            announcements.forEach(ann => {
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #e2e8f0; gap: 10px;">
                        <span style="font-size: 14px;">${ann.text}</span>
                        <div style="display: flex; gap: 5px;">
                            <button
    type="button"
    data-admin-only="true"
    onclick="editAnnouncementItem(${ann.id})"
    style="background:none; border:none; color:#2563eb; cursor:pointer;"
    title="Edit"
>
    ✏️
</button>
                            <button
    type="button"
    data-admin-only="true"
    onclick="deleteAnnouncementItem(${ann.id})"
    style="background:none; border:none; color:#ef4444; cursor:pointer;"
    title="Delete"
>
    ❌
</button>
                    </div>
                `;
            });
        }
        html += `</div>`;
        bodyContainer.innerHTML = html;
    }
}

function addNewActivityItem() {

    if (!requireAdmin()) {
        return;
    }

    let titleEl = document.getElementById("newActTitle");
    let dateEl = document.getElementById("newActDate");
    let title = titleEl ? titleEl.value.trim() : "";
    let date = dateEl ? dateEl.value.trim() : "";

    if (!title || !date) {
        alert("Punan ang pamagat at petsa.");
        return;
    }

    let activities = [];
    try {
        activities = JSON.parse(
            localStorage.getItem("churchhq_activities")
        ) || [];
    } catch (e) {}

    const newActivity = {
        id: Date.now(),
        title,
        date
    };

    activities.push(newActivity);

    // Supabase INSERT
    saveActivityToSupabase(newActivity);

    activities.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    localStorage.setItem(
        "churchhq_activities",
        JSON.stringify(activities)
    );

    renderManageModalContent();
    renderDashboardLists();

}

function editActivityItem(id) {

    if (!requireAdmin()) {
        return;
    }

    let activities = [];
    try { activities = JSON.parse(localStorage.getItem("churchhq_activities")) || []; } catch(e){}
    let act = activities.find(a => a.id === id);
    if (!act) return;

    let customModal = document.getElementById("customEditModal");
    if (!customModal) {
        customModal = document.createElement("div");
        customModal.id = "customEditModal";
        customModal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;";
        customModal.innerHTML = `
            <div style="background:white;padding:20px;border-radius:8px;width:350px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <h4 style="margin-top:0;margin-bottom:12px;font-size:16px;color:#1e293b;">Edit activity</h4>
                <label style="font-size:12px;color:#64748b;">Title:</label>
                <input type="text" id="editActTitleInput" style="width:100%;padding:8px;margin-bottom:10px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;">
                <label style="font-size:12px;color:#64748b;">Date:</label>
                <input type="text" id="editActDateInput" style="width:100%;padding:8px;margin-bottom:15px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;">
                <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button type="button" id="cancelEditBtn" style="padding:6px 12px;background:#e2e8f0;border:none;border-radius:4px;cursor:pointer;">Cancel</button>
                    <button type="button" id="saveEditBtn" style="padding:6px 12px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(customModal);
    } else {
        customModal.style.display = "flex";
    }

    document.getElementById("editActTitleInput").value = act.title;
    document.getElementById("editActDateInput").value = act.date;

    document.getElementById("saveEditBtn").onclick = function() {
        let newTitle = document.getElementById("editActTitleInput").value.trim();
        let newDate = document.getElementById("editActDateInput").value.trim();

        if (!newTitle || !newDate) {
            alert("Pakipunan ang pamagat at petsa.");
            return;
        }

        act.title = newTitle;
        act.date = newDate;

        // Supabase UPDATE
        updateActivityToSupabase(act);

        activities.sort((a, b) => new Date(a.date) - new Date(b.date));
        localStorage.setItem("churchhq_activities", JSON.stringify(activities));
        
        customModal.style.display = "none";
        renderManageModalContent();
        renderDashboardLists();
    };

    document.getElementById("cancelEditBtn").onclick = function() {
        customModal.style.display = "none";
    };
}



async function deleteActivityItem(id) {

    if (!requireAdmin()) {
        return;
    }

    if (!confirm("Are you sure you want to delete this?")) return;

    const deletedFromSupabase =
        await deleteActivityFromSupabase(id);

    if (!deletedFromSupabase) {
        alert("❌ Failed to delete the activity in Supabase.");
        return;
    }

    let activities = [];
    try {
        activities =
            JSON.parse(
                localStorage.getItem("churchhq_activities")
            ) || [];
    } catch(e) {}

    activities = activities.filter(
        a => a.id !== id
    );

    localStorage.setItem(
        "churchhq_activities",
        JSON.stringify(activities)
    );

    renderManageModalContent();
    renderDashboardLists();
    applyRoleBasedUI();
}

function addNewAnnouncementItem() {
    if (!requireAdmin()) {
    return;
}

    let annTextEl = document.getElementById("newAnnText");
    let text = annTextEl ? annTextEl.value.trim() : "";
    if (!text) {
        alert("Ilagay ang text ng announcement.");
        return;
    }

    let announcements = [];
    try { announcements = JSON.parse(localStorage.getItem("churchhq_announcements")) || []; } catch(e){}
    
    const newAnnouncement = {
    id: Date.now(),
    text
};

announcements.push(newAnnouncement);

// Supabase INSERT
saveAnnouncementToSupabase(newAnnouncement);
    localStorage.setItem("churchhq_announcements", JSON.stringify(announcements));
    renderManageModalContent();
    renderDashboardLists();
}

function editAnnouncementItem(id) {
    if (!requireAdmin()) {
    return;
}

    let announcements = [];

    try {
        announcements =
            JSON.parse(
                localStorage.getItem("churchhq_announcements")
            ) || [];
    } catch (e) {}

    let ann = announcements.find(a => a.id === id);

    if (!ann) return;

    let customAnnModal =
        document.getElementById("customEditAnnModal");

    if (!customAnnModal) {
        customAnnModal = document.createElement("div");

        customAnnModal.id = "customEditAnnModal";

        customAnnModal.style.cssText =
            "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;";

        customAnnModal.innerHTML = `
            <div style="background:white;padding:20px;border-radius:8px;width:350px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <h4 style="margin-top:0;margin-bottom:12px;font-size:16px;color:#1e293b;">
                   Edit Announcement
                </h4>

                <label style="font-size:12px;color:#64748b;">
                    Text:
                </label>

                <input
                    type="text"
                    id="editAnnTextInput"
                    style="width:100%;padding:8px;margin-bottom:15px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;"
                >

                <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button
                        type="button"
                        id="cancelEditAnnBtn"
                        style="padding:6px 12px;background:#e2e8f0;border:none;border-radius:4px;cursor:pointer;"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="saveEditAnnBtn"
                        style="padding:6px 12px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;"
                    >
                        Save
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(customAnnModal);
    } else {
        customAnnModal.style.display = "flex";
    }

    document.getElementById("editAnnTextInput").value =
        ann.text;

    document.getElementById("saveEditAnnBtn").onclick =
        async function() {

            let newText =
                document
                    .getElementById("editAnnTextInput")
                    .value
                    .trim();

            if (!newText) {
                alert("Pakilagay ang text ng announcement.");
                return;
            }

            ann.text = newText;

            // SUPABASE UPDATE
            const updated =
                await updateAnnouncementToSupabase(ann);

            if (!updated) {
                alert(
                    "❌ Failed to update announcement from Supabase."
                );
                return;
            }

            // LOCAL STORAGE
            localStorage.setItem(
                "churchhq_announcements",
                JSON.stringify(announcements)
            );

            customAnnModal.style.display = "none";

                        renderManageModalContent();
            renderDashboardLists();
        };

    document.getElementById("cancelEditAnnBtn").onclick =
        function() {
            customAnnModal.style.display = "none";
        };

}

async function deleteAnnouncementItem(id) {
    if (!requireAdmin()) {
    return;
}
    if (!confirm("Are you sure you want to delete this")) return;

    // SUPABASE DELETE
    const deleted =
        await deleteAnnouncementFromSupabase(id);

    if (!deleted) {
        alert(
            "❌ Failed to delete the announcement in Supabase"
        );
        return;
    }

    let announcements = [];

    try {
        announcements =
            JSON.parse(
                localStorage.getItem("churchhq_announcements")
            ) || [];
    } catch(e) {}

    announcements = announcements.filter(
        a => a.id !== id
    );

    localStorage.setItem(
        "churchhq_announcements",
        JSON.stringify(announcements)
    );

    renderManageModalContent();
    renderDashboardLists();
}

function renderDashboardLists() {
    const actList = document.getElementById("dashboardActivities");
    const annList = document.getElementById("dashboardAnnouncements");

    let activities = [];
    try {
        activities = JSON.parse(localStorage.getItem("churchhq_activities")) || [
            { id: 1, title: "Sunday Worship", date: "July 27" },
            { id: 2, title: "Prayer Meeting", date: "July 29" }
        ];
    } catch(e) {
        activities = [];
    }

    let announcements = [];
    try {
        announcements = JSON.parse(localStorage.getItem("churchhq_announcements")) || [
            { id: 1, text: "Choir Practice - Friday" },
            { id: 2, text: "Communion Next Sunday" }
        ];
    } catch(e) {
        announcements = [];
    }

    activities.sort((a, b) => {
        let dateA = new Date(a.date);
        let dateB = new Date(b.date);
        return (isNaN(dateA) || isNaN(dateB)) ? 0 : dateA - dateB;
    });

    if (actList) {
        if (activities.length === 0) {
            actList.innerHTML = `<tr><td colspan="2" style="color:#9ca3af; padding:10px; text-align:center;">No upcoming activities.</td></tr>`;
        } else {
            const groupedByMonth = {};
            activities.forEach(act => {
                const monthKey = act.date ? act.date.split(' ')[0] : 'Iba pa';
                if (!groupedByMonth[monthKey]) {
                    groupedByMonth[monthKey] = [];
                }
                groupedByMonth[monthKey].push(act);
            });

            let htmlContent = '';
            for (const [month, acts] of Object.entries(groupedByMonth)) {
                htmlContent += `
                    <div style="margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                        <div style="background: #f1f5f9; padding: 6px 10px; font-weight: bold; font-size: 13px; color: #1e293b;">
                            📅 ${month}
                        </div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tbody>
                `;

                acts.forEach(a => {
                    htmlContent += `
                        <tr style="border-top: 1px solid #f1f5f9;">
                            <td style="padding: 8px 10px; font-size: 13px;">${a.title}</td>
                            <td style="padding: 8px 10px; font-size: 13px; text-align: right; color: #64748b;">${a.date}</td>
                        </tr>
                    `;
                });

                htmlContent += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            actList.innerHTML = htmlContent;
        }
    }

    if (annList) {
        annList.innerHTML = announcements.length === 0 
            ? `<li>No announcements.</li>`
            : announcements.map(ann => `<li>${ann.text}</li>`).join("");
    }
}

function generateCOJTGKStreamDetailsFromSaved() {
    const prefix = "sun_";
    
    const getVal = (fieldId) => {
        const el = document.getElementById(prefix + fieldId);
        return el ? el.value.trim() : "";
    };

    const dateVal = getVal("serviceDate");
    let formattedDate = dateVal;
    if (dateVal) {
        const parsedDate = new Date(dateVal);
        if (!isNaN(parsedDate)) {
            formattedDate = parsedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
    } else {
        formattedDate = new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    const worshipLeader = getVal("worshipLeader") || "Eslee Abregana";
    const speaker = getVal("preacher") || "Ptr. Apolinario 'Jun' Bañez";
    const messageTitle = getVal("messageTitle") || "Sunday Message";
    const rawSongs = getVal("songsLineup");

    const streamTitle = `COJTGK Sunday Service - ${formattedDate}`;

    let songsListText = "• Pagsamba at Pagpupuri";
    if (rawSongs) {
        const songLines = rawSongs.split("\n").filter(s => s.trim() !== "");
        songsListText = songLines.map(s => s.startsWith("•") ? s : `• ${s}`).join("\n");
    }

    const streamDesc = 
`COJTGK Sunday Service - ${formattedDate}
——————————
𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗼𝘂𝗿 𝗦𝘂𝗻𝗱𝗮𝘆 𝗦𝗲𝗿𝘃𝗶𝗰𝗲! 
We are so glad you’re joining us today as we worship the King of kings.

𝐏𝐑𝐀𝐈𝐒𝐄 & 𝐖𝐎𝐑𝐒𝐇𝐈𝐏 𝑙𝑒𝑑 𝑏𝑦 ${worshipLeader}
${songsListText}

𝐓𝐎𝐃𝐀𝐘'𝐒 𝐌𝐄𝐒𝐒𝐀𝐆𝐄
 𝘚𝘱𝘦𝘢𝘬𝘦𝘳: ${speaker}
 𝘛𝘪𝘵𝘭𝘦: ${messageTitle} 

Church of Jesus the Glorious King, Inc. (COJTGK)
Recorded Live  ||  Sunday Service  || ${formattedDate}
——————————
 𝑺𝑻𝑨𝒀 𝑪𝑶𝑵𝑵𝑬𝑪𝑻𝑬𝑫
 𝘍𝘉: facebook.com/COJTGKofficial
 𝘠𝘛: youtube.com/@cojtgkofficial
#COJTGK #SundayService #Worship2026`;

    const outTitle = document.getElementById("outputStreamTitle");
    const outDesc = document.getElementById("outputStreamDesc");
    if (outTitle) outTitle.value = streamTitle;
    if (outDesc) outDesc.value = streamDesc;
}

function copyMidweekDetails() {
    const titleEl = document.getElementById("outputMidweekTitle");
    const descEl = document.getElementById("outputMidweekDesc");
    const title = titleEl ? titleEl.value : "";
    const desc = descEl ? descEl.value : "";
    const fullText = `TITLE:\n${title}\n\nDESCRIPTION:\n${desc}`;

    navigator.clipboard.writeText(fullText).then(() => {
        alert("Na-copy na ang COJTGK Midweek Service Title at Description!");
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
}

function copyToClipboard(elementId) {
    const textElement = document.getElementById(elementId);
    if (!textElement) {
        console.error("Element not found:", elementId);
        return;
    }
    
    const textToCopy = textElement.value || textElement.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Na-kopya na sa clipboard!");
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
}   

function generateMidweekStreamContent() {
    const midSelect = document.getElementById('midGenDateSelect');
    if (!midSelect || midSelect.value === "") {
        alert("Please choose a date first for the English Midweek Service.");
        return;
    }

    const index = Number(midSelect.value);
    const serviceData = midweekServices[index];

    if (!serviceData) {
        alert("No details found for this date. Save the service data first.");
        return;
    }

    if (typeof generateCOJTGKMidweekStreamDetailsFromSaved === 'function') {
        generateCOJTGKMidweekStreamDetailsFromSaved();
    } else {
        const outputTitle = document.getElementById('outputMidweekTitle');
        const outputDesc = document.getElementById('outputMidweekDesc');

        if (outputTitle) {
            outputTitle.value = `MIDWEEK SERVICE - ${serviceData.date}`;
        }

        if (outputDesc) {
            outputDesc.value = `Worship Leader: ${serviceData.worshipLeader || ''}\nPreacher: ${serviceData.preacher || ''}\nMessage Title: ${serviceData.messageTitle || ''}\n\nJoin us for our Midweek Service!`;
        }
    }
}

function generateCOJTGKMidweekStreamDetailsFromSaved() {
    const midSelect = document.getElementById('midGenDateSelect');
    let serviceData = null;

    if (midSelect && midSelect.value !== "") {
        const index = Number(midSelect.value);
        serviceData = midweekServices[index];
    }

    const prefix = "mid_";
    const getVal = (fieldId) => {
        const el = document.getElementById(prefix + fieldId);
        return el ? el.value.trim() : "";
    };

    const dateVal = serviceData ? serviceData.date : getVal("serviceDate");
    let formattedDate = dateVal;
    
    if (dateVal) {
        const parsedDate = new Date(dateVal);
        if (!isNaN(parsedDate)) {
            formattedDate = parsedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
    } else {
        formattedDate = new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    const worshipLeader = serviceData ? (serviceData.worshipLeader || "Eslee Abregana") : (getVal("worshipLeader") || "Eslee Abregana");
    const speaker = serviceData ? (serviceData.preacher || "Ptr. Apolinario 'Jun' Bañez") : (getVal("preacher") || "Ptr. Apolinario 'Jun' Bañez");
    const messageTitle = serviceData ? (serviceData.messageTitle || "Midweek Message") : (getVal("messageTitle") || "Midweek Message");
    const rawSongs = serviceData ? serviceData.songsLineup : getVal("songsLineup");

    const streamTitle = `COJTGK Midweek Service - ${formattedDate}`;

    let songsListText = "• Pagsamba at Pagpupuri";
    if (rawSongs) {
        const songLines = rawSongs.split("\n").filter(s => s.trim() !== "");
        songsListText = songLines.map(s => s.startsWith("•") ? s : `• ${s}`).join("\n");
    }

    const streamDesc = 
`COJTGK Midweek Service - ${formattedDate}
——————————
𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗼𝘂𝗿 𝗠𝗶𝗱𝘄𝗲𝗲𝗸 𝗦𝗲𝗿𝘃𝗶𝗰𝗲! 
Join us as we gather together to study God's Word, worship Him, and lift up one another in prayer.

𝐏𝐑𝐀𝐈𝐒𝐄 & 𝐖𝐎𝐑𝐒𝐇𝐈𝐏 𝑙𝑒𝑑 𝑏𝑦 ${worshipLeader}
${songsListText}

𝐓𝐎𝐃𝐀𝐘'𝐒 𝐌𝐄𝐒𝐒𝐀𝐆𝐄
 𝘚𝘱𝘦𝘢𝘬𝘦𝘳: ${speaker}
 𝘛𝘪𝘵𝘭𝗲: ${messageTitle} 

Church of Jesus the Glorious King, Inc. (COJTGK)
Recorded Live  ||  Midweek Service  || ${formattedDate}
——————————
 𝑺𝑻𝑨𝒀 𝑪𝑶𝑵𝑵𝑬𝑪𝑻𝑬𝑫
 𝘍𝘉: facebook.com/COJTGKofficial
 𝘠𝘛: youtube.com/@cojtgkofficial
#COJTGK #MidweekService #Worship2026`;

    const outTitle = document.getElementById("outputMidweekTitle");
    const outDesc = document.getElementById("outputMidweekDesc");
    if (outTitle) outTitle.value = streamTitle;
    if (outDesc) outDesc.value = streamDesc;
}

function populateMidweekGeneratorFields() {
    const midSelect = document.getElementById('midGenDateSelect');
    if (!midSelect || midSelect.value === "") return;

    const index = Number(midSelect.value);
    const selectedRecord = midweekServices[index];

    if (selectedRecord) {
        const preacherEl = document.getElementById('midGenPreacher');
        const titleEl = document.getElementById('midGenMessageTitle');
        
        if (preacherEl) preacherEl.value = selectedRecord.preacher || '';
        if (titleEl) titleEl.value = selectedRecord.messageTitle || '';
        
        if (typeof generateCOJTGKMidweekStreamDetailsFromSaved === 'function') {
            generateCOJTGKMidweekStreamDetailsFromSaved();
        }
    }
}

async function initializeChurchHQ() {

    console.log("🚀 Initializing ChurchHQ from Supabase...");

    try {

        await testSupabaseConnection();

        await loadMembersFromSupabase();
        await loadTasksFromSupabase();
        await loadServicesFromSupabase();
        await loadSongsFromSupabase();
        await loadActivitiesFromSupabase();
        await loadAnnouncementsFromSupabase();
        await loadAttendanceFromSupabase();

        // =====================================
        // REFRESH DASHBOARD DATA
        // =====================================

        renderMemberStatusAlerts();
        populateMinistryDashboardSelect();

        
        console.log(
            "✅ ChurchHQ Supabase initialization complete."
        );

    } catch (error) {

        console.error(
            "❌ ChurchHQ initialization error:",
            error
        );

    }

}

// =====================================
// CHURCHHQ LOGIN SYSTEM
// =====================================


async function loginUser(){

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value.trim();


    const message =
        document.getElementById("loginMessage");


    if(!email || !password){

        message.innerHTML =
        "❌ Please enter email and password.";

        return;
    }



    const {data,error} =
        await churchSupabase.auth.signInWithPassword({

            email: email,
            password: password

        });



    if(error){

        console.error(error);

        message.innerHTML =
        "❌ Invalid login.";

        return;
    }



    console.log(
        "✅ Login successful:",
        data
    );


showChurchApp();

await loadCurrentUserRole();

applyRoleBasedUI();

initializeChurchHQ();


}

// =====================================
// CHURCHHQ USER ROLE
// =====================================



async function loadCurrentUserRole(){

    try {

        const {
            data: {
                user
            },
            error: userError
        } = await churchSupabase.auth.getUser();


        if(userError){

            console.error(
                "❌ Failed to get current user:",
                userError
            );

            currentUser = null;
            currentUserRole = null;

            return null;
        }


        if(!user){

            console.log(
                "ℹ️ No authenticated user."
            );

            currentUser = null;
            currentUserRole = null;

            return null;
        }


        currentUser = user;


        const {
            data: roleData,
            error: roleError
        } = await churchSupabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();


        if(roleError){

            console.error(
                "❌ Failed to load user role:",
                roleError
            );

            currentUserRole = null;

            return null;
        }


        currentUserRole =
            roleData?.role || null;


        console.log(
            "👤 Current user:",
            currentUser.email
        );


        console.log(
            "🔐 Current role:",
            currentUserRole
        );


        return currentUserRole;


    } catch(error){

        console.error(
            "❌ User role detection error:",
            error
        );

        currentUser = null;
        currentUserRole = null;

        return null;
    }

}

// =====================================
// CHURCHHQ ROLE PERMISSIONS
// =====================================

function isAdminUser(){

    return currentUserRole === "admin";

}


function isViewerUser(){

    return currentUserRole === "viewer";

}


function requireAdmin(){

    if(!isAdminUser()){

        console.warn(
            "🚫 Admin permission required."
        );

        alert(
            "You do not have permission to perform this action."
        );

        return false;
    }

    return true;

}

function applyRoleBasedUI(){

    console.log(
        "🔐 Applying role-based UI:",
        currentUserRole
    );


    const adminControls =
        document.querySelectorAll(
            '[data-admin-only="true"]'
        );


    adminControls.forEach(element => {

        if(isAdminUser()){

            element.style.display = "";

            element.disabled = false;

        }else{

            element.style.display = "none";

            element.disabled = true;

        }

    });


    console.log(
        isAdminUser()
            ? "👑 Admin UI enabled"
            : "👁️ Viewer UI enabled"
    );

}


function showChurchApp(){

    const login =
    document.getElementById("loginScreen");


    const app =
    document.getElementById("churchApp");


    if(login)
        login.style.display="none";


    if(app)
        app.style.display="block";


    console.log(
        "✅ ChurchHQ App unlocked"
    );


}



// CHECK EXISTING SESSION

// CHECK EXISTING SESSION

async function checkLoginSession(){

    const {
        data
    } =
    await churchSupabase.auth.getSession();


    if(
        data.session
    ){

        console.log(
            "✅ Existing session found"
        );

showChurchApp();

await loadCurrentUserRole();

applyRoleBasedUI();

initializeChurchHQ();

    }

}


// RUN ON LOAD

document.addEventListener(
"DOMContentLoaded",
()=>{

    checkLoginSession();

});

// =====================================
// LOGOUT SYSTEM
// =====================================

async function logoutUser(){

    const { error } =
        await churchSupabase.auth.signOut();


    if(error){

        console.error(
            "Logout error:",
            error
        );

        return;
    }


    console.log(
        "✅ Logged out"
    );

currentUser = null;
currentUserRole = null;


    const login =
        document.getElementById("loginScreen");


    const app =
        document.getElementById("churchApp");


    if(login)
        login.style.display="flex";


    if(app)
        app.style.display="none";


}

