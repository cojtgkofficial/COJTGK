
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

// =====================================
// AUDIT LOG GLOBAL DATA
// =====================================

let auditLogs = [];

let auditCurrentPage = 1;

const auditPageSize = 10;

// =====================================
// GLOBAL MINISTRIES STATE
// =====================================

var ministries = [];
var members = [];

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
        refreshDashboardStatus();
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

// =====================================================
// LEADERS - MODAL OPEN / CLOSE
// =====================================================

function openLeaderModal() {

    if (!requireAdmin()) {
        return;
    }

    const modal =
        document.getElementById("leaderModal");

    const memberSelect =
        document.getElementById("leaderMemberSelect");

    const positionInput =
        document.getElementById("leaderPosition");

    const contactInput =
        document.getElementById("leaderContact");

    const levelSelect =
        document.getElementById("leaderLevel");

    const slotInput =
        document.getElementById("leaderSlotId");

    const modalTitle =
        document.getElementById("leaderModalTitle");


    if (!modal || !memberSelect) {
        return;
    }


    // Reset form
    memberSelect.innerHTML = `
        <option value="">
            Select Member
        </option>
    `;

    if (positionInput) {
        positionInput.value = "";
    }

    if (contactInput) {
        contactInput.value = "";
    }

    if (levelSelect) {
        levelSelect.value = "3";
    }

    if (slotInput) {
        slotInput.value = "";
    }

    if (modalTitle) {
        modalTitle.textContent =
            "Add Leader";
    }


    // Sort members alphabetically
    const sortedMembers =
        [...members].sort((a, b) =>
            String(a.name || "")
                .localeCompare(
                    String(b.name || ""),
                    undefined,
                    {
                        sensitivity: "base"
                    }
                )
        );


    // Populate members dropdown
    sortedMembers.forEach(member => {

        const option =
            document.createElement("option");

        option.value =
            member.id;

        option.textContent =
            member.name || "Unnamed Member";

        memberSelect.appendChild(
            option
        );

    });

    populateLeaderPhotoSelect();
    modal.classList.remove("hidden");

}


// =====================================================
// LEADERS - CLOSE MODAL
// =====================================================

function closeLeaderModal() {

    const modal =
        document.getElementById(
            "leaderModal"
        );


    if (modal) {
        modal.classList.add("hidden");
    }

}


// =====================================================
// LEADERS - AUTO CONTACT FROM MEMBER
// =====================================================

const leaderMemberSelect =
    document.getElementById(
        "leaderMemberSelect"
    );


if (leaderMemberSelect) {

    leaderMemberSelect.addEventListener(
        "change",
        function () {

            const selectedMember =
                members.find(
                    member =>
                        String(member.id) ===
                        String(this.value)
                );


            const contactInput =
                document.getElementById(
                    "leaderContact"
                );


            if (!contactInput) {
                return;
            }


            if (!selectedMember) {

                contactInput.value = "";

                return;

            }


            contactInput.value =
                selectedMember.contact ||
                "No Contact";

        }
    );

}

// =====================================================
// LEADERS DATA
// =====================================================

let churchLeaders = [];

// =====================================================
// LEADER PHOTO LIST
// Manual image list from images/leaders/
// =====================================================

const leaderImages = [

    "Head Pastor.jpg",
    "Pastor 1.jpg",
    "Pastor 2.jpg",
    "Pastor 3.jpg",
    "Adult Ministry Leader.jpg",
    "Womens Fellowship Leader.jpg",
    "Mens Fellowship Leader.jpg",
    "Youth Leader 1.jpg",
    "Youth Leader 2.jpg",
    "Young Pro Leader 1.jpg",
    "Young Pro Leader 2.jpg",
    "Children Ministry Leader.jpg",
    "Music Ministry Leader.jpg",
    "Prayer and Fasting Ministry Leader.jpg",
    "Ushering and Follow up Ministry Leader.jpg",
    "Security Ministry Leader.jpg",
    "Secretary.jpg",
    "Treasurer.jpg"

];

// =====================================================
// POPULATE LEADER PHOTO SELECT
// =====================================================

function populateLeaderPhotoSelect(
    selectedPath = ""
) {

    const select =
        document.getElementById(
            "leaderPhotoSelect"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            No Photo / Use Initials
        </option>
    `;


    leaderImages.forEach(
        fileName => {

            const option =
                document.createElement(
                    "option"
                );


            const fullPath =
                `images/leaders/${fileName}`;


            option.value =
                fullPath;


            option.textContent =
                fileName;


            if (
                fullPath ===
                selectedPath
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );


    updateLeaderPhotoPreview(
        select.value
    );

}

// =====================================================
// LEADER PHOTO PREVIEW
// =====================================================

function updateLeaderPhotoPreview(
    imagePath
) {

    const preview =
        document.getElementById(
            "leaderPhotoPreview"
        );

    const text =
        document.getElementById(
            "leaderPhotoPreviewText"
        );


    if (!preview) {
        return;
    }


    if (!imagePath) {

        preview.src = "";

        preview.style.display =
            "none";


        if (text) {

            text.textContent =
                "No photo selected.";

        }


        return;
    }


    preview.src =
        imagePath;

    preview.style.display =
        "block";


    if (text) {

        text.textContent =
            imagePath;

    }

}

const leaderPhotoSelect =
    document.getElementById(
        "leaderPhotoSelect"
    );


if (leaderPhotoSelect) {

    leaderPhotoSelect.addEventListener(
        "change",
        function () {

            updateLeaderPhotoPreview(
                this.value
            );

        }
    );

}

// =====================================================
// LEADERS - SUPABASE READ
// =====================================================

async function loadLeadersFromSupabase() {

    try {

        const { data, error } =
            await churchSupabase
                .from("church_leaders")
                .select("*")
                .order("level", {
                    ascending: true
                })
                .order("id", {
                    ascending: true
                });


        if (error) {

            console.error(
                "❌ Failed to load leaders from Supabase:",
                error
            );

            return false;
        }


        // Convert Supabase format
        // into the format used by renderLeaders()

        churchLeaders =
            (data || []).map(
                leader => ({

                    id:
                        leader.id,

                    memberId:
                        leader.member_id,

                    memberName:
                        leader.member_name || "",

                    position:
                        leader.position || "",

                    slotKey:
                        leader.slot_key || "",

                    level:
                        Number(
                            leader.level || 3
                        ),
                        imagePath:
    leader.image_path || ""
                })
            );


        // Optional local cache

        localStorage.setItem(
            "churchhq_leaders",
            JSON.stringify(
                churchLeaders
            )
        );


        // Refresh chart

        renderLeaders();


        console.log(
            "✅ Church leaders loaded from Supabase:",
            churchLeaders
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Leaders Supabase read error:",
            error
        );

        return false;
    }

}

loadLeadersFromSupabase();

// =====================================================
// LEADERS - SUPABASE INSERT
// =====================================================

async function saveLeaderToSupabase(leader) {

    try {

        const { data, error } =
            await churchSupabase
                .from("church_leaders")
                .insert([{
                    member_id:
                        leader.memberId,

                    member_name:
                        leader.memberName || "",

                    position:
                        leader.position || "",

                    slot_key:
                        leader.slotKey,

                    level:
                        leader.level || 3,

                        image_path:
    leader.imagePath || ""

                }])
                .select()
                .single();


        if (error) {

            console.error(
                "❌ Failed to save leader to Supabase:",
                error
            );

            return null;
        }


        console.log(
            "✅ Leader saved to Supabase:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "❌ Leader Supabase insert error:",
            error
        );

        return null;
    }

}

// =====================================================
// SAVE LEADER ASSIGNMENT
// =====================================================

async function saveLeaderAssignment() {

    if (!requireAdmin()) {
        return;
    }

    const memberSelect =
        document.getElementById(
            "leaderMemberSelect"
        );

    const positionInput =
        document.getElementById(
            "leaderPosition"
        );

    const levelSelect =
        document.getElementById(
            "leaderLevel"
        );

    const slotInput =
        document.getElementById(
            "leaderSlotId"
        );


    if (
        !memberSelect ||
        !positionInput ||
        !levelSelect
    ) {
        return;
    }


    // =====================================
    // VALUES
    // =====================================

    const memberId =
        memberSelect.value;

    const position =
        positionInput.value.trim();

    const level =
        Number(levelSelect.value);

    const editId =
        slotInput
            ? slotInput.value
            : "";

const photoSelect =
    document.getElementById(
        "leaderPhotoSelect"
    );

const imagePath =
    photoSelect
        ? photoSelect.value
        : "";

    // =====================================
    // VALIDATION
    // =====================================

    if (!memberId) {

        alert(
            "Please select a member."
        );

        return;
    }


    if (!position) {

        alert(
            "Please enter a leadership position."
        );

        return;
    }


    const selectedMember =
        members.find(member =>
            String(member.id) ===
            String(memberId)
        );


    if (!selectedMember) {

        alert(
            "Selected member was not found."
        );

        return;
    }


    // =====================================
    // EDIT EXISTING LEADER
    // =====================================

    if (editId) {

        const index =
            churchLeaders.findIndex(
                leader =>
                    String(leader.id) ===
                    String(editId)
            );


        if (index === -1) {

            alert(
                "❌ Leader record was not found."
            );

            return;
        }


        const updatedLeaderData = {

            id:
                churchLeaders[index].id,

            memberId:
                selectedMember.id,

            memberName:
                selectedMember.name || "",

            position,

            slotKey:
                churchLeaders[index].slotKey ||
                `leader-${churchLeaders[index].id}`,

            level,

            imagePath:
    imagePath || ""

        };


        const updatedLeader =
            await updateLeaderInSupabase(
                updatedLeaderData
            );


        if (!updatedLeader) {

            alert(
                "❌ Failed to update leader in Supabase."
            );

            return;
        }


        churchLeaders[index] = {

            id:
                updatedLeader.id,

            memberId:
                updatedLeader.member_id,

            memberName:
                updatedLeader.member_name || "",

            position:
                updatedLeader.position || "",

            slotKey:
                updatedLeader.slot_key || "",

            level:
                Number(
                    updatedLeader.level || 3
                ),
                imagePath:
    updatedLeader.image_path || ""

        };

// =====================================
// AUDIT - EDIT LEADER
// =====================================

await writeAuditLog(
    "EDIT",
    "Leaders",
    `Updated leader: ${updatedLeader.member_name || selectedMember.name}`,
    updatedLeader.id,
    {
        memberName:
            updatedLeader.member_name ||
            selectedMember.name ||
            "",

        position:
            updatedLeader.position ||
            position,

        level:
            Number(
                updatedLeader.level ||
                level
            ),

        imagePath:
            updatedLeader.image_path ||
            ""
    }
);

    }


    // =====================================
    // ADD NEW LEADER
    // =====================================

    else {

        const newLeader = {

            memberId:
                selectedMember.id,

            memberName:
                selectedMember.name || "",

            position,

            level,

            slotKey:
                `leader-${Date.now()}`,

                imagePath:
        imagePath || ""

        };


        const savedLeader =
            await saveLeaderToSupabase(
                newLeader
            );


        if (!savedLeader) {

            alert(
                "❌ Failed to save leader to Supabase."
            );

            return;
        }


        churchLeaders.push({

            id:
                savedLeader.id,

            memberId:
                savedLeader.member_id,

            memberName:
                savedLeader.member_name || "",

            position:
                savedLeader.position || "",

            slotKey:
                savedLeader.slot_key || "",

            level:
                Number(
                    savedLeader.level || 3
                ),
                imagePath:
    savedLeader.image_path || ""

        });

        // =====================================
// AUDIT - ADD LEADER
// =====================================

await writeAuditLog(
    "ADD",
    "Leaders",
    `Added leader: ${savedLeader.member_name || selectedMember.name}`,
    savedLeader.id,
    {
        memberName:
            savedLeader.member_name ||
            selectedMember.name ||
            "",

        position:
            savedLeader.position ||
            position,

        level:
            Number(
                savedLeader.level ||
                level
            ),

        imagePath:
            savedLeader.image_path ||
            ""
    }
);

    }


    // =====================================
    // LOCAL CACHE
    // =====================================

    localStorage.setItem(
        "churchhq_leaders",
        JSON.stringify(
            churchLeaders
        )
    );


    // =====================================
    // REFRESH UI
    // =====================================

    renderLeaders();

    closeLeaderModal();

}



// =====================================================
// RENDER LEADERS - DYNAMIC ORGANIZATIONAL CHART
// =====================================================

function renderLeaders() {

    const chart =
        document.querySelector(
            ".leaders-org-chart"
        );

    if (!chart) {
        return;
    }


    // =====================================
    // CLEAR CURRENT CHART
    // =====================================

    chart.innerHTML = "";


    // =====================================
    // NO LEADERS
    // =====================================

    if (
        !Array.isArray(churchLeaders) ||
        churchLeaders.length === 0
    ) {

        chart.innerHTML = `

            <div class="leaders-level-group">

                <div class="leaders-level-label">
                    Level 1
                </div>

                <div class="leaders-level leaders-level-dynamic">

                    <div class="leader-slot">

                        <div class="leader-slot-empty">

                            <div class="leader-slot-icon">
                                +
                            </div>

                            <strong>
                                Main Leader
                            </strong>

                            <span>
                                No leader assigned
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        `;

        return;
    }


    // =====================================
    // SORT LEADERS
    // Level first, then position/name
    // =====================================

    const sortedLeaders =
        [...churchLeaders]
            .sort((a, b) => {

                const levelA =
                    Number(a.level || 3);

                const levelB =
                    Number(b.level || 3);


                if (levelA !== levelB) {

                    return levelA - levelB;

                }


                const positionCompare =
                    String(a.position || "")
                        .localeCompare(
                            String(b.position || ""),
                            undefined,
                            {
                                sensitivity: "base"
                            }
                        );


                if (positionCompare !== 0) {

                    return positionCompare;

                }


                return String(
                    a.memberName || ""
                ).localeCompare(
                    String(
                        b.memberName || ""
                    ),
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );

            });


    // =====================================
    // GET USED LEVELS
    // =====================================

    const levels =
        [
            ...new Set(
                sortedLeaders.map(
                    leader =>
                        Number(
                            leader.level || 3
                        )
                )
            )
        ]
        .sort(
            (a, b) => a - b
        );


    // =====================================
    // CREATE EACH LEVEL
    // =====================================

    levels.forEach(
        (levelNumber, levelIndex) => {


            const levelLeaders =
                sortedLeaders.filter(
                    leader =>
                        Number(
                            leader.level || 3
                        ) ===
                        levelNumber
                );


            // =====================================
            // LEVEL CONTAINER
            // =====================================

            const levelGroup =
                document.createElement(
                    "div"
                );


            levelGroup.className =
                "leaders-level-group";


            levelGroup.dataset.level =
                levelNumber;


            // =====================================
            // LEVEL LABEL
            // =====================================

            const levelLabel =
                document.createElement(
                    "div"
                );


            levelLabel.className =
                "leaders-level-label";


            let levelName = "";


            if (levelNumber === 1) {

                levelName =
                    "Main Leadership";

            } else if (
                levelNumber === 2
            ) {

                levelName =
                    "Supporting Leadership";

            } else if (
                levelNumber === 3
            ) {

                levelName =
                    "Ministry Leadership";

            } else if (
                levelNumber === 4
            ) {

                levelName =
                    "Department / Team Leadership";

            } else {

                levelName =
                    "Additional Leadership";

            }


            levelLabel.innerHTML = `

                <span>
                    Level ${levelNumber}
                </span>

                <strong>
                    ${levelName}
                </strong>

            `;


            levelGroup.appendChild(
                levelLabel
            );


            // =====================================
            // LEADER ROW
            // =====================================

            const levelRow =
                document.createElement(
                    "div"
                );


            levelRow.className =
                "leaders-level leaders-level-dynamic";


            // Automatic columns based on
            // number of leaders
            levelRow.style.setProperty(
                "--leader-count",
                Math.min(
                    levelLeaders.length,
                    4
                )
            );


            // =====================================
            // CREATE LEADER CARDS
            // =====================================

            levelLeaders.forEach(
                leader => {


                    const member =
                        members.find(
                            member =>
                                String(
                                    member.id
                                ) ===
                                String(
                                    leader.memberId
                                )
                        );


                    // Use member database first.
                    // Fall back to saved leader name.
                    const memberName =
                        member
                            ? (
                                member.name ||
                                leader.memberName ||
                                "Unnamed Member"
                            )
                            : (
                                leader.memberName ||
                                "Unnamed Member"
                            );


                    const contact =
                        member
                            ? (
                                member.contact ||
                                "No Contact"
                            )
                            : "No Contact";


                    // =====================================
                    // INITIALS
                    // =====================================

                    const initials =
                        String(
                            memberName
                        )
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map(
                                word =>
                                    word
                                        .charAt(0)
                                        .toUpperCase()
                            )
                            .join("") ||
                        "?";


                    // =====================================
                    // CARD
                    // =====================================

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "leader-slot";


                    card.dataset.leaderId =
                        leader.id;


                    card.innerHTML = `

    <div class="leader-card">

        <div class="leader-card-avatar">

            ${
                leader.imagePath
                    ? `
                        <img
                            src="${leader.imagePath}"
                            alt="Leader Photo"
                            class="leader-photo"
                        >
                    `
                    : `
                        <span>
                            ${initials}
                        </span>
                    `
            }

        </div>


        <h3>
            ${memberName}
        </h3>


        <div class="leader-position">

            ${
                leader.position ||
                "Leader"
            }

        </div>


        <div class="leader-contact">

            ${contact}

        </div>


        <div class="leader-card-actions">

            <button
                type="button"
                class="secondary-btn"
                data-admin-only="true"
                onclick="editLeader(${leader.id})"
            >
                ✏️ Edit
            </button>


            <button
                type="button"
                class="secondary-btn leader-delete-btn"
                data-admin-only="true"
                onclick="deleteLeader(${leader.id})"
            >
                ✖ Delete
            </button>

        </div>

    </div>

`;


                    levelRow.appendChild(
                        card
                    );

                }
            );


            levelGroup.appendChild(
                levelRow
            );


            chart.appendChild(
                levelGroup
            );


            // =====================================
            // CONNECTOR TO NEXT LEVEL
            // =====================================

            if (
                levelIndex <
                levels.length - 1
            ) {

                const connector =
                    document.createElement(
                        "div"
                    );


                connector.className =
                    "leader-dynamic-connector";


                connector.innerHTML = `

                    <div class="leader-connector-line"></div>

                    <div class="leader-connector-horizontal"></div>

                `;


                chart.appendChild(
                    connector
                );

            }

        }
    );


    // =====================================
    // APPLY ADMIN / VIEWER UI AGAIN
    // Important because buttons were
    // dynamically generated
    // =====================================

    if (
        typeof applyRoleBasedUI ===
        "function"
    ) {

        applyRoleBasedUI();

    }

}
// =====================================================
// EDIT LEADER
// =====================================================

function editLeader(id) {

    if (!requireAdmin()) {
        return;
    }

    const leader =
        churchLeaders.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!leader) {
        return;
    }


    // Open modal first
    openLeaderModal();


    const memberSelect =
        document.getElementById(
            "leaderMemberSelect"
        );

    const positionInput =
        document.getElementById(
            "leaderPosition"
        );

    const contactInput =
        document.getElementById(
            "leaderContact"
        );

    const levelSelect =
        document.getElementById(
            "leaderLevel"
        );

    const slotInput =
        document.getElementById(
            "leaderSlotId"
        );

    const modalTitle =
        document.getElementById(
            "leaderModalTitle"
        );

    populateLeaderPhotoSelect(
    leader.imagePath || ""
);

    const member =
        members.find(
            item =>
                String(item.id) ===
                String(
                    leader.memberId
                )
        );


    if (memberSelect) {
        memberSelect.value =
            leader.memberId;
    }


    if (positionInput) {
        positionInput.value =
            leader.position || "";
    }


    if (contactInput) {

        contactInput.value =
            member
                ? (
                    member.contact ||
                    "No Contact"
                )
                : "";

    }


    if (levelSelect) {
        levelSelect.value =
            String(
                leader.level || 3
            );
    }


    if (slotInput) {
        slotInput.value =
            leader.id;
    }


    if (modalTitle) {
        modalTitle.textContent =
            "Edit Leader";
    }

}



// =====================================================
// DELETE LEADER
// =====================================================

async function deleteLeader(id) {

    if (!requireAdmin()) {
        return;
    }

    const leader =
        churchLeaders.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!leader) {

        alert(
            "Leader record was not found."
        );

        return;
    }

    const confirmed =
        confirm(
            `Are you sure you want to remove ${leader.memberName || "this leader"} from ${leader.position || "this position"}?`
        );

    if (!confirmed) {
        return;
    }

    const deleted =
        await deleteLeaderFromSupabase(id);

    if (!deleted) {

        alert(
            "❌ Failed to delete leader from Supabase."
        );

        return;
    }

    // =====================================
// AUDIT - DELETE LEADER
// =====================================

await writeAuditLog(
    "DELETE",
    "Leaders",
    `Deleted leader: ${leader.memberName || "Unknown Leader"}`,
    leader.id,
    {
        memberName:
            leader.memberName || "",

        position:
            leader.position || "",

        level:
            Number(
                leader.level || 3
            ),

        imagePath:
            leader.imagePath || ""
    }
);

    churchLeaders =
        churchLeaders.filter(
            item =>
                String(item.id) !==
                String(id)
        );

    localStorage.setItem(
        "churchhq_leaders",
        JSON.stringify(
            churchLeaders
        )
    );

    renderLeaders();

    alert(
        "✅ Leader removed successfully."
    );

    // =====================================
// RE-APPLY ROLE PERMISSIONS
// =====================================

if (
    typeof applyRoleBasedUI === "function"
) {
    applyRoleBasedUI();
}
}

// =====================================================
// LEADERS - SUPABASE DELETE
// =====================================================

async function deleteLeaderFromSupabase(id) {

    try {

        const { data, error } =
            await churchSupabase
                .from("church_leaders")
                .delete()
                .eq("id", id)
                .select();

        if (error) {

            console.error(
                "❌ Failed to delete leader from Supabase:",
                error
            );

            return false;
        }

        console.log(
            "✅ Leader deleted from Supabase:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Leader Supabase delete error:",
            error
        );

        return false;
    }
}

// =====================================================
// LEADERS - SUPABASE UPDATE
// =====================================================

async function updateLeaderInSupabase(leader) {

    try {

        const {
            data,
            error
        } =
            await churchSupabase

                .from("church_leaders")

                .update({

                    member_id:
                        leader.memberId,

                    member_name:
                        leader.memberName || "",

                    position:
                        leader.position || "",

                    slot_key:
                        leader.slotKey || "",

                    level:
                        leader.level || 3,

                    image_path:
                        leader.imagePath || ""

                })

                .eq(
                    "id",
                    leader.id
                )

                .select()

                .single();


        if (error) {

            console.error(
                "❌ Failed to update leader in Supabase:",
                error
            );

            return null;
        }


        console.log(
            "✅ Leader updated in Supabase:",
            data
        );


        return data;


    } catch (error) {

        console.error(
            "❌ Leader Supabase update error:",
            error
        );

        return null;
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

// =====================================
// PAGE NAVIGATION WITH ROLE ACCESS
// =====================================

function showPage(pageId) {

    // =====================================
    // VIEWER RESTRICTED PAGES
    // =====================================

const viewerRestrictedPages = [

    "service-planner",
    "program-planner",

    "members",
    "leaders",
    "attendance",
    "reports",
    "settings"

];


    if (
        isViewerUser() &&
        viewerRestrictedPages.includes(
            pageId
        )
    ) {

        console.warn(
            "🚫 Viewer attempted to open restricted page:",
            pageId
        );


        alert(
            "You do not have permission to access this page."
        );


        pageId =
            "dashboard";

    }


    // =====================================
    // HIDE ALL PAGES
    // =====================================

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(page => {

            page.classList.add(
                "hidden"
            );

        });


    // =====================================
    // REMOVE ACTIVE NAV
    // =====================================

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    // =====================================
    // SHOW TARGET PAGE
    // =====================================

    const targetPage =
        document.getElementById(
            pageId
        );


    if (targetPage) {

        targetPage.classList.remove(
            "hidden"
        );

    }

// =====================================================
// AUTO LOAD PROGRAM PLANNER
// =====================================================

if (pageId === "program-planner") {

    currentProgramType =
        currentProgramType ||
        "sunday";


    if (
        typeof switchProgramPlannerTab ===
        "function"
    ) {

        switchProgramPlannerTab(
            currentProgramType
        );

    }

}


// =====================================================
// AUTO LOAD AUDIT LOG
// SETTINGS + ADMIN ONLY
// =====================================================

if (
    pageId === "settings" &&
    isAdminUser()
) {

    if (
        typeof loadAuditLogsFromSupabase ===
        "function"
    ) {

        loadAuditLogsFromSupabase();

    }

}


// =====================================
// AUDIT - PAGE VIEW
// =====================================

if (
    currentUser &&
    currentUserRole
) {

    const pageNames = {

        dashboard:
            "Dashboard",

        planner:
            "Planner",

        "service-planner":
            "Service Planner",

        "program-planner":
             "Program Planner",

        "sunday-service":
            "Sunday Service",

        "midweek-service":
            "Midweek Service",

        songs:
            "Song Library",

        editor:
            "Editor",

        members:
            "Members",

        leaders:
            "Leaders",

        attendance:
            "Attendance",

        files:
            "Files",

        reports:
            "Reports",

        settings:
            "Settings"

    };


    const readablePageName =
        pageNames[pageId] ||
        pageId;


    writeAuditLog(
        "VIEW",
        readablePageName,
        `${currentUserRole} viewed ${readablePageName}.`
    );

}

    // =====================================
    // ACTIVE SIDEBAR ITEM
    // =====================================

    const activeNav =
        document.querySelector(
            `.nav-item[onclick*="${pageId}"]`
        );


    if (activeNav) {

        activeNav.classList.add(
            "active"
        );

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


// =====================================================
// SERVICE PLANNER TABS
// =====================================================

function switchServicePlannerTab(type) {

    const sundayPanel =
        document.getElementById(
            "serviceSundayPanel"
        );

    const midweekPanel =
        document.getElementById(
            "serviceMidweekPanel"
        );

    const sundayTab =
        document.getElementById(
            "serviceTabSunday"
        );

    const midweekTab =
        document.getElementById(
            "serviceTabMidweek"
        );


    if (
        !sundayPanel ||
        !midweekPanel
    ) {
        return;
    }


    // =====================================
    // SUNDAY
    // =====================================

    if (type === "sunday") {

        sundayPanel.classList.remove(
            "hidden"
        );

        midweekPanel.classList.add(
            "hidden"
        );


        if (sundayTab) {
            sundayTab.classList.add(
                "active"
            );
        }


        if (midweekTab) {
            midweekTab.classList.remove(
                "active"
            );
        }

    }


    // =====================================
    // MIDWEEK
    // =====================================

    else {

        sundayPanel.classList.add(
            "hidden"
        );

        midweekPanel.classList.remove(
            "hidden"
        );


        if (sundayTab) {
            sundayTab.classList.remove(
                "active"
            );
        }


        if (midweekTab) {
            midweekTab.classList.add(
                "active"
            );
        }

    }


    // =====================================
    // RESTORE ROLE PERMISSIONS
    // =====================================

    if (
        typeof applyRoleBasedUI ===
        "function"
    ) {

        applyRoleBasedUI();

    }

}


/* =========================================
   SUNDAY & MIDWEEK SERVICE MULTI-RECORD ENGINE
========================================= */
let sundayServices = [];
let midweekServices = [];
let editingSundayServiceId = null;
let editingMidweekServiceId = null;

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

let targetArray =
    type === "sunday"
        ? sundayServices
        : midweekServices;


const editingId =
    type === "sunday"
        ? editingSundayServiceId
        : editingMidweekServiceId;


// =====================================
// UPDATE EXISTING SERVICE
// =====================================

if (editingId !== null) {

    const existingIndex =
        targetArray.findIndex(
            item =>
                String(item.id) ===
                String(editingId)
        );


    if (existingIndex === -1) {

        alert(
            "❌ Existing service record was not found."
        );

        return;
    }


    serviceRecord.id =
        editingId;


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


    targetArray[existingIndex] = {
        ...serviceRecord,
        id: editingId
    };


    await writeAuditLog(
        "EDIT",

        type === "sunday"
            ? "Sunday Service"
            : "Midweek Service",

        `Updated ${
            type === "sunday"
                ? "Sunday"
                : "Midweek"
        } Service record for ${dateValue}`,

        editingId,

        {
            date:
                dateValue,

            preacher:
                serviceRecord.preacher ||
                "",

            messageTitle:
                serviceRecord.messageTitle ||
                "",

            worshipLeader:
                serviceRecord.worshipLeader ||
                ""
        }
    );

}


else {

    const savedServiceId =
    await saveServiceToSupabase(
        type,
        serviceRecord
    );


if (!savedServiceId) {

    alert(
        "❌ Service record was not saved to Supabase."
    );

    return;
}


// =====================================
// ATTACH REAL SUPABASE ID
// =====================================

serviceRecord.id =
    savedServiceId;


targetArray.push(
    serviceRecord
);

    // =====================================
// AUDIT - ADD SERVICE RECORD
// =====================================

await writeAuditLog(
    "ADD",
    type === "sunday"
        ? "Sunday Service"
        : "Midweek Service",
    `Added ${
        type === "sunday"
            ? "Sunday"
            : "Midweek"
    } Service record for ${dateValue}`,
    dateValue,
    {
        date: dateValue,
        preacher:
            serviceRecord.preacher || "",
        messageTitle:
            serviceRecord.messageTitle || "",
        worshipLeader:
            serviceRecord.worshipLeader || ""
    }
);
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

    refreshDashboardStatus();
}

function loadServiceRecord(type, date) {

    if (!requireAdmin()) {
        return;
    }


    const targetArray =
        type === "sunday"
            ? sundayServices
            : midweekServices;


    const record =
        targetArray.find(
            item =>
                item.date === date
        );


    if (!record) {

        alert(
            "Service record was not found."
        );

        return;
    }


    // =====================================
    // SET EDIT MODE
    // =====================================

    if (type === "sunday") {

        editingSundayServiceId =
            record.id || null;

    } else {

        editingMidweekServiceId =
            record.id || null;

    }


    // =====================================
    // LOAD VALUES INTO FORM
    // =====================================

    const prefix =
        type === "sunday"
            ? "sun_"
            : "mid_";


    const dateEl =
        document.getElementById(
            prefix + "serviceDate"
        );


    if (dateEl) {

        dateEl.value =
            record.date || "";

    }


    const setVal =
        (fieldName, value) => {

            const el =
                document.getElementById(
                    prefix +
                    fieldName
                );


            if (el) {

                el.value =
                    value || "";

            }

        };


    setVal(
        "worshipLeader",
        record.worshipLeader
    );

    setVal(
        "backingVocals",
        record.backingVocals
    );

    setVal(
        "keys",
        record.keys
    );

    setVal(
        "guitar",
        record.guitar
    );

    setVal(
        "bass",
        record.bass
    );

    setVal(
        "drums",
        record.drums
    );

    setVal(
        "pptOperator",
        record.pptOperator
    );

    setVal(
        "soundEngineer",
        record.soundEngineer
    );

    setVal(
        "liveStream",
        record.liveStream
    );

    setVal(
        "preacher",
        record.preacher
    );

    setVal(
        "messageTitle",
        record.messageTitle
    );

    setVal(
        "songsLineup",
        record.songsLineup
    );


    // =====================================
    // CHANGE SAVE BUTTON TEXT
    // =====================================

    const panelId =
        type === "sunday"
            ? "serviceSundayPanel"
            : "serviceMidweekPanel";


    const saveButton =
        document.querySelector(
            `#${panelId} button[onclick="saveServiceData('${type}')"]`
        );


    if (saveButton) {

        saveButton.textContent =
            type === "sunday"
                ? "💾 Update Sunday Roster"
                : "💾 Update Midweek Roster";

    }


    // =====================================
    // SCROLL TO FORM
    // =====================================

    const panel =
        document.getElementById(
            panelId
        );


    if (panel) {

        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}

function renderServiceHistory(type) {

    const listBody =
        document.getElementById(
            `${type}HistoryBody`
        );

    if (!listBody) {
        return;
    }


    const targetArray =
        type === "sunday"
            ? sundayServices
            : midweekServices;


    listBody.innerHTML = "";


    // =====================================
    // NO RECORDS
    // =====================================

    if (targetArray.length === 0) {

        const colspan =
            type === "midweek"
                ? 5
                : 4;

        listBody.innerHTML = `
            <tr>
                <td
                    colspan="${colspan}"
                    style="
                        padding:15px;
                        text-align:center;
                        color:#9ca3af;
                    "
                >
                    No saved records found.
                </td>
            </tr>
        `;

        return;
    }


    // =====================================
    // RENDER RECORDS
    // =====================================

    targetArray.forEach(
        record => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.style.borderBottom =
                "1px solid #f1f5f9";


            // =====================================
            // MIDWEEK HISTORY
            // =====================================

            if (type === "midweek") {

                const multimediaText = [

                    record.pptOperator
                        ? `PPT: ${record.pptOperator}`
                        : "",

                    record.soundEngineer
                        ? `Sound: ${record.soundEngineer}`
                        : "",

                    record.liveStream
                        ? `Live: ${record.liveStream}`
                        : ""

                ]
                    .filter(Boolean)
                    .join("<br>");


                tr.innerHTML = `

                    <td style="padding:10px;">
                        <b>
                            ${record.date || "-"}
                        </b>
                    </td>


                    <td style="padding:10px; font-size:12px; line-height:1.6;">
                        ${
                            multimediaText ||
                            "-"
                        }
                    </td>


                    <td style="padding:10px;">
                        ${
                            record.preacher ||
                            "-"
                        }
                    </td>


                    <td style="padding:10px;">
                        ${
                            record.messageTitle ||
                            "-"
                        }
                    </td>


                    <td
                        style="
                            padding:10px;
                            display:flex;
                            gap:8px;
                        "
                    >

                        <button
                            type="button"
                            class="secondary-btn"
                            data-admin-only="true"
                            style="
                                padding:3px 8px;
                                font-size:12px;
                            "
                            onclick="loadServiceRecord(
                                'midweek',
                                '${record.date}'
                            )"
                        >
                            ✏️ Load/Edit
                        </button>


                        <button
                            type="button"
                            class="secondary-btn"
                            data-admin-only="true"
                            style="
                                padding:3px 8px;
                                font-size:12px;
                                color:#ef4444;
                                border-color:#fca5a5;
                            "
                            onclick="deleteServiceRecord(
                                'midweek',
                                '${record.date}'
                            )"
                        >
                            ❌ Delete
                        </button>

                    </td>

                `;

            }


            // =====================================
            // SUNDAY HISTORY
            // =====================================

            else {

                tr.innerHTML = `

                    <td style="padding:10px;">
                        <b>
                            ${record.date || "-"}
                        </b>
                    </td>


                    <td style="padding:10px;">
                        ${
                            record.worshipLeader ||
                            "-"
                        }
                    </td>


                    <td style="padding:10px;">
                        ${
                            record.preacher ||
                            "-"
                        }
                    </td>


                    <td
                        style="
                            padding:10px;
                            display:flex;
                            gap:8px;
                        "
                    >

                        <button
                            type="button"
                            class="secondary-btn"
                            data-admin-only="true"
                            style="
                                padding:3px 8px;
                                font-size:12px;
                            "
                            onclick="loadServiceRecord(
                                'sunday',
                                '${record.date}'
                            )"
                        >
                            ✏️ Load/Edit
                        </button>


                        <button
                            type="button"
                            class="secondary-btn"
                            data-admin-only="true"
                            style="
                                padding:3px 8px;
                                font-size:12px;
                                color:#ef4444;
                                border-color:#fca5a5;
                            "
                            onclick="deleteServiceRecord(
                                'sunday',
                                '${record.date}'
                            )"
                        >
                            ❌ Delete
                        </button>

                    </td>

                `;

            }


            listBody.appendChild(
                tr
            );

        }
    );


    // =====================================
    // RE-APPLY ROLE PERMISSIONS
    // =====================================

    if (
        typeof applyRoleBasedUI ===
        "function"
    ) {

        applyRoleBasedUI();

    }

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


        const { data, error } =
            await churchSupabase
                .from("service_records")
                .insert([
                    {
                        id: serviceId,

                        service_type:
                            type,

                        date:
                            serviceRecord.date,

                        worship_leader:
                            serviceRecord.worshipLeader || "",

                        backing_vocals:
                            serviceRecord.backingVocals || "",

                        keys:
                            serviceRecord.keys || "",

                        guitar:
                            serviceRecord.guitar || "",

                        bass:
                            serviceRecord.bass || "",

                        drums:
                            serviceRecord.drums || "",

                        ppt_operator:
                            serviceRecord.pptOperator || "",

                        sound_engineer:
                            serviceRecord.soundEngineer || "",

                        live_stream:
                            serviceRecord.liveStream || "",

                        preacher:
                            serviceRecord.preacher || "",

                        message_title:
                            serviceRecord.messageTitle || "",

                        songs_lineup:
                            serviceRecord.songsLineup || ""
                    }
                ])
                .select()
                .single();


        if (error) {

            console.error(
                "❌ Failed to save service to Supabase:",
                error
            );

            return null;
        }


        if (!data || !data.id) {

            console.error(
                "❌ Supabase saved the service but no ID was returned."
            );

            return null;
        }


        console.log(
            "✅ Service saved to Supabase:",
            data
        );


        // IMPORTANT:
        // Return the real saved ID
        return data.id;


    } catch (error) {

        console.error(
            "❌ Service Supabase insert error:",
            error
        );

        return null;
    }

}
// =====================================
// SERVICE - SUPABASE UPDATE
// =====================================

async function updateServiceToSupabase(
    type,
    serviceRecord
) {

    try {

        if (!serviceRecord.id) {

            console.error(
                "❌ Missing service ID for update."
            );

            return false;

        }


        const {
            data,
            error
        } =
            await churchSupabase

                .from(
                    "service_records"
                )

                .update({

                    date:
                        serviceRecord.date,

                    worship_leader:
                        serviceRecord.worshipLeader ||
                        "",

                    backing_vocals:
                        serviceRecord.backingVocals ||
                        "",

                    keys:
                        serviceRecord.keys ||
                        "",

                    guitar:
                        serviceRecord.guitar ||
                        "",

                    bass:
                        serviceRecord.bass ||
                        "",

                    drums:
                        serviceRecord.drums ||
                        "",

                    ppt_operator:
                        serviceRecord.pptOperator ||
                        "",

                    sound_engineer:
                        serviceRecord.soundEngineer ||
                        "",

                    live_stream:
                        serviceRecord.liveStream ||
                        "",

                    preacher:
                        serviceRecord.preacher ||
                        "",

                    message_title:
                        serviceRecord.messageTitle ||
                        "",

                    songs_lineup:
                        serviceRecord.songsLineup ||
                        ""

                })

                .eq(
                    "id",
                    serviceRecord.id
                )

                .eq(
                    "service_type",
                    type
                )

                .select();


        if (error) {

            console.error(
                "❌ Failed to update service in Supabase:",
                error
            );

            return false;

        }


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            console.error(
                "❌ No service record was updated."
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

// =====================================
// AUDIT - DELETE SERVICE RECORD
// =====================================

await writeAuditLog(
    "DELETE",
    type === "sunday"
        ? "Sunday Service"
        : "Midweek Service",
    `Deleted ${
        type === "sunday"
            ? "Sunday"
            : "Midweek"
    } Service record for ${date}`,
    date,
    {
        date: date,
        serviceType: type
    }
);

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

    refreshDashboardStatus();

    alert(
        `✅ ${type === "sunday" ? "Sunday" : "Midweek"} Service on ${date} was successfully deleted.`
    );
}

function resetServiceForm(type) {

    const prefix =
        type === "sunday"
            ? "sun_"
            : "mid_";


    const dateEl =
        document.getElementById(
            prefix + "serviceDate"
        );


    if (dateEl) {
        dateEl.value = "";
    }


    const fields = [
        "worshipLeader",
        "backingVocals",
        "keys",
        "guitar",
        "bass",
        "drums",
        "pptOperator",
        "soundEngineer",
        "liveStream",
        "preacher",
        "messageTitle",
        "songsLineup"
    ];


    fields.forEach(field => {

        const el =
            document.getElementById(
                prefix + field
            );


        if (el) {
            el.value = "";
        }

    });


    // =====================================
    // EXIT EDIT MODE
    // =====================================

    if (type === "sunday") {

        editingSundayServiceId = null;

    } else {

        editingMidweekServiceId = null;

    }


    // =====================================
    // RESTORE SAVE BUTTON
    // =====================================

    const panelId =
        type === "sunday"
            ? "serviceSundayPanel"
            : "serviceMidweekPanel";


    const saveButton =
        document.querySelector(
            `#${panelId} button[onclick="saveServiceData('${type}')"]`
        );


    if (saveButton) {

        saveButton.textContent =
            type === "sunday"
                ? "💾 Save Sunday Roster"
                : "💾 Save Midweek Roster";

    }

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




// =====================================
// DASHBOARD - EVENTS THIS MONTH
// =====================================

function loadEventCountFromSupabase() {

    const eventCountEl =
        document.getElementById(
            "eventCount"
        );

    if (!eventCountEl) {
        return;
    }


    const today =
        new Date();

    const currentYear =
        today.getFullYear();

    const currentMonth =
        today.getMonth();


    const count =
        (Array.isArray(annualActivities)
            ? annualActivities
            : []
        )
        .filter(activity => {

            if (!activity.date) {
                return false;
            }


            const activityDate =
                new Date(
                    activity.date +
                    "T00:00:00"
                );


            return (
                activityDate.getFullYear() === currentYear &&
                activityDate.getMonth() === currentMonth
            );

        })
        .length;


    eventCountEl.textContent =
        count;
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

    addTaskBtn.addEventListener(
        "click",
        () => {

            clearForm();

            populateTaskAssigneeSelect();

            openTaskModal();

        }
    );

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


    const title =
        document
            .getElementById(
                "taskTitle"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "taskDescription"
            )
            .value
            .trim();


    const category =
        document.getElementById(
            "taskCategory"
        ).value;


    const priority =
        document.getElementById(
            "taskPriority"
        ).value;


    const dueDate =
        document.getElementById(
            "taskDate"
        ).value;


    const status =
        document.getElementById(
            "taskStatus"
        ).value;


    const assignedSelect =
        document.getElementById(
            "taskAssignedTo"
        );


    const assignedMemberId =
        assignedSelect
            ? assignedSelect.value
            : "";


    const selectedMember =
        members.find(
            member =>
                String(member.id) ===
                String(assignedMemberId)
        );


    const assignedTo =
        selectedMember
            ? selectedMember.name || ""
            : "";


    if (title === "") {

        alert(
            "Please enter task title."
        );

        return;
    }


 // =====================================
// EDIT EXISTING TASK
// =====================================

if (
    editingTaskId !== null
) {

    const index =
        tasks.findIndex(
            task =>
                task.id ===
                editingTaskId
        );


    if (index !== -1) {

        const updatedTask = {

            id:
                editingTaskId,

            title,

            description,

            category,

            priority,

            dueDate,

            status,

            assignedMemberId:
                assignedMemberId
                    ? Number(
                        assignedMemberId
                    )
                    : null,

            assignedTo

        };


        const updatedInSupabase =
            await updateTaskToSupabase(
                updatedTask
            );


        if (!updatedInSupabase) {

            alert(
                "❌ Task was not updated in Supabase."
            );

            return;
        }


        tasks[index] =
            updatedTask;


        // =====================================
        // AUDIT - EDIT PLANNER TASK
        // =====================================

        await writeAuditLog(
            "EDIT",
            "Planner",
            `Updated task: ${updatedTask.title}`,
            updatedTask.id,
            {
                title:
                    updatedTask.title,

                category:
                    updatedTask.category,

                priority:
                    updatedTask.priority,

                dueDate:
                    updatedTask.dueDate,

                status:
                    updatedTask.status,

                assignedTo:
                    updatedTask.assignedTo || ""
            }
        );

    }


    editingTaskId =
        null;

}


// =====================================
// ADD NEW TASK
// =====================================

else {

    const task = {

        id:
            Date.now(),

        title,

        description,

        category,

        priority,

        dueDate,

        status,

        assignedMemberId:
            assignedMemberId
                ? Number(
                    assignedMemberId
                )
                : null,

        assignedTo

    };


    const savedToSupabase =
        await saveTaskToSupabase(
            task
        );


    if (!savedToSupabase) {

        alert(
            "❌ Task was not saved to Supabase."
        );

        return;
    }


    tasks.push(
        task
    );


    // =====================================
    // AUDIT - ADD PLANNER TASK
    // =====================================

    await writeAuditLog(
        "ADD",
        "Planner",
        `Added task: ${task.title}`,
        task.id,
        {
            title:
                task.title,

            category:
                task.category,

            priority:
                task.priority,

            dueDate:
                task.dueDate,

            status:
                task.status,

            assignedTo:
                task.assignedTo || ""
        }
    );

}


// =====================================
// REFRESH
// =====================================

saveToLocalStorage();

loadSavedTasks();

clearForm();

closeTaskModal();

refreshDashboardStatus();

}

function openEditTaskModal(id) {

    if (!requireAdmin()) {
        return;
    }


    const task =
        tasks.find(
            t => t.id === id
        );


    if (!task) {
        return;
    }


    editingTaskId =
        id;


    document.getElementById(
        "taskTitle"
    ).value =
        task.title || "";


    document.getElementById(
        "taskDescription"
    ).value =
        task.description || "";


    document.getElementById(
        "taskCategory"
    ).value =
        task.category || "";


    document.getElementById(
        "taskPriority"
    ).value =
        task.priority || "";


    document.getElementById(
        "taskDate"
    ).value =
        task.dueDate || "";


    document.getElementById(
        "taskStatus"
    ).value =
        task.status || "todo";


    // =====================================
    // RESTORE ASSIGNED MEMBER
    // =====================================

    populateTaskAssigneeSelect(
        task.assignedMemberId || ""
    );


    const searchInput =
        document.getElementById(
            "taskAssigneeSearch"
        );


    if (
        searchInput &&
        task.assignedTo
    ) {

        searchInput.value =
            task.assignedTo;

    }


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

    id:
        task.id,

    title:
        task.title || "",

    description:
        task.description || "",

    category:
        task.category || "",

    priority:
        task.priority || "",

    dueDate:
        task.due_date || "",

    status:
        task.status || "todo",

    assignedMemberId:
        task.assigned_member_id || null,

    assignedTo:
        task.assigned_to || ""

}));

       localStorage.setItem(
    "churchhq_tasks",
    JSON.stringify(tasks)
);

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

async function saveTaskToSupabase(
    task
) {

    try {

        const {
            data,
            error
        } =
            await churchSupabase

                .from(
                    "planner_tasks"
                )

                .insert([{

                    id:
                        task.id,

                    title:
                        task.title,

                    description:
                        task.description || "",

                    category:
                        task.category || "",

                    priority:
                        task.priority || "",

                    due_date:
                        task.dueDate || null,

                    status:
                        task.status || "todo",

                    assigned_member_id:
                        task.assignedMemberId ||
                        null,

                    assigned_to:
                        task.assignedTo || ""

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

async function saveTaskToSupabase(
    task
) {

    try {

        const {
            data,
            error
        } =
            await churchSupabase

                .from(
                    "planner_tasks"
                )

                .insert([{

                    id:
                        task.id,

                    title:
                        task.title,

                    description:
                        task.description || "",

                    category:
                        task.category || "",

                    priority:
                        task.priority || "",

                    due_date:
                        task.dueDate || null,

                    status:
                        task.status || "todo",

                    assigned_member_id:
                        task.assignedMemberId ||
                        null,

                    assigned_to:
                        task.assignedTo || ""

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

        const {
            data,
            error
        } =
            await churchSupabase

                .from("planner_tasks")

                .update({

                    title:
                        task.title,

                    description:
                        task.description || "",

                    category:
                        task.category || "",

                    priority:
                        task.priority || "",

                    due_date:
                        task.dueDate || null,

                    status:
                        task.status || "todo",

                    assigned_member_id:
                        task.assignedMemberId || null,

                    assigned_to:
                        task.assignedTo || ""

                })

                .eq(
                    "id",
                    task.id
                )

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

// =====================================================
// PLANNER - SEARCHABLE MEMBER ASSIGNEE
// =====================================================

function populateTaskAssigneeSelect(
    selectedMemberId = ""
) {

    const select =
        document.getElementById(
            "taskAssignedTo"
        );

    const searchInput =
        document.getElementById(
            "taskAssigneeSearch"
        );


    if (
        !select ||
        !searchInput
    ) {
        return;
    }


    select.innerHTML = "";
    select.style.display = "none";
    searchInput.value = "";


    // =====================================
    // EXISTING ASSIGNEE DURING EDIT
    // =====================================

    if (selectedMemberId) {

        const selectedMember =
            members.find(
                member =>
                    String(member.id) ===
                    String(selectedMemberId)
            );


        if (selectedMember) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                selectedMember.id;

            option.textContent =
                selectedMember.name || "";

            option.selected = true;

            select.appendChild(
                option
            );


            searchInput.value =
                selectedMember.name || "";

        }

    }


    // =====================================
    // SEARCH RESULTS
    // =====================================

    function renderOptions(
        searchText
    ) {

        const search =
            String(searchText || "")
                .trim()
                .toLowerCase();


        select.innerHTML = "";


        if (!search) {

            select.style.display =
                "none";

            return;

        }


        const sortedMembers =
            Array.isArray(members)
                ? [...members]
                : [];


        sortedMembers.sort(
            (a, b) =>
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


        const filteredMembers =
            sortedMembers.filter(
                member =>
                    String(
                        member.name || ""
                    )
                        .toLowerCase()
                        .includes(search)
            );


        select.style.display =
            "block";


        if (
            filteredMembers.length === 0
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.value = "";

            option.textContent =
                "No member found";

            option.disabled = true;

            select.appendChild(
                option
            );

            return;

        }


        filteredMembers.forEach(
            member => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    member.id;

                option.textContent =
                    member.name ||
                    "Unnamed Member";

                select.appendChild(
                    option
                );

            }
        );

    }


    searchInput.oninput =
        function () {

            renderOptions(
                this.value
            );

        };


    select.onchange =
        function () {

            const member =
                members.find(
                    member =>
                        String(member.id) ===
                        String(this.value)
                );


            if (!member) {
                return;
            }


            searchInput.value =
                member.name || "";

            select.style.display =
                "none";

        };

}

// =====================================================
// CHURCH ANNUAL ACTIVITIES
// BASIC UI
// =====================================================

let annualActivities = [];

let selectedAnnualActivityYear =
    new Date().getFullYear();


const annualActivityMonths = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];


// =====================================================
// LOAD YEAR SELECTOR
// =====================================================

function loadAnnualActivityYearSelector() {

    const select =
        document.getElementById(
            "annualActivityYear"
        );

    if (!select) {
        return;
    }


    const currentYear =
        new Date().getFullYear();


    select.innerHTML = "";


    // Current year +/- 5 years
    for (
        let year = currentYear - 5;
        year <= currentYear + 5;
        year++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            year;

        option.textContent =
            year;


        if (
            year ===
            selectedAnnualActivityYear
        ) {

            option.selected =
                true;

        }


        select.appendChild(
            option
        );

    }


    select.onchange =
        function () {

            selectedAnnualActivityYear =
                Number(
                    this.value
                );


            renderAnnualActivities();

        };

}


// =====================================================
// RENDER JANUARY - DECEMBER
// =====================================================

function renderAnnualActivities() {

    const grid =
        document.getElementById(
            "annualActivitiesGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    annualActivityMonths.forEach(
        (monthName, monthIndex) => {


            // Activities for this month/year
            const monthActivities =
                annualActivities
                    .filter(activity => {

                        if (!activity.date) {
                            return false;
                        }


                        const activityDate =
                            new Date(
                                activity.date +
                                "T00:00:00"
                            );


                        return (
                            activityDate.getFullYear() ===
                                selectedAnnualActivityYear &&

                            activityDate.getMonth() ===
                                monthIndex
                        );

                    })
                    .sort(
                        (a, b) =>
                            String(a.date)
                                .localeCompare(
                                    String(b.date)
                                )
                    );


            // =====================================
            // MONTH CARD
            // =====================================

            const monthCard =
                document.createElement(
                    "div"
                );


            monthCard.className =
                "annual-month-card";


            // =====================================
            // MONTH HEADER
            // =====================================

            const monthTitle =
                document.createElement(
                    "div"
                );


            monthTitle.className =
                "annual-month-title";


            monthTitle.innerHTML = `

                <strong>
                    ${monthName}
                </strong>

                <span class="annual-month-count">
                    ${monthActivities.length}
                </span>

            `;


            monthCard.appendChild(
                monthTitle
            );


            // =====================================
            // MONTH LIST
            // =====================================

            const list =
                document.createElement(
                    "div"
                );


            list.className =
                "annual-month-list";


            // =====================================
            // EMPTY MONTH
            // =====================================

            if (
                monthActivities.length === 0
            ) {

                list.innerHTML = `

                    <div class="annual-month-empty">

                        No activities scheduled

                    </div>

                `;

            }


            // =====================================
            // ACTIVITIES
            // =====================================

            else {

                monthActivities.forEach(
                    activity => {


                        const activityDate =
                            new Date(
                                activity.date +
                                "T00:00:00"
                            );


                        const formattedDate =
                            activityDate
                                .toLocaleDateString(
                                    "en-US",
                                    {
                                        month:
                                            "short",

                                        day:
                                            "numeric"
                                    }
                                );


                        const item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "annual-activity-item";


                        item.innerHTML = `

                            <div class="annual-activity-date">

                                ${formattedDate}

                            </div>


                            <div class="annual-activity-title">

                                ${
                                    activity.title ||
                                    "Untitled Activity"
                                }

                            </div>

                                    <div
    class="annual-activity-actions"
    data-admin-only="true"
>

    <button
        type="button"
        class="secondary-btn"
        onclick="editAnnualActivity(${activity.id})"
    >
        ✏️ Edit
    </button>

    <button
        type="button"
        class="secondary-btn"
        onclick="deleteAnnualActivity(${activity.id})"
    >
        ✖ Delete
    </button>

</div>
                        `;


                        list.appendChild(
                            item
                        );

                    }
                );

            }


            monthCard.appendChild(
                list
            );


            grid.appendChild(
                monthCard
            );

        }
    );

}

// =====================================================
// ANNUAL ACTIVITY MODAL
// =====================================================

function openAnnualActivityModal() {

    if (!requireAdmin()) {
        return;
    }

    const modal =
        document.getElementById(
            "annualActivityModal"
        );

    if (!modal) {
        return;
    }


    document.getElementById(
        "annualActivityModalTitle"
    ).textContent =
        "Add Annual Activity";


    document.getElementById(
        "annualActivityTitle"
    ).value = "";


    document.getElementById(
        "annualActivityDate"
    ).value = "";


    document.getElementById(
        "annualActivityDescription"
    ).value = "";


    document.getElementById(
        "annualActivityEditId"
    ).value = "";


    modal.classList.remove(
        "hidden"
    );
}


// =====================================================
// CLOSE ANNUAL ACTIVITY MODAL
// =====================================================

function closeAnnualActivityModal() {

    const modal =
        document.getElementById(
            "annualActivityModal"
        );

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }
}

// =====================================================
// SAVE ANNUAL ACTIVITY
// =====================================================

function saveAnnualActivity() {

    if (!requireAdmin()) {
        return;
    }


    const titleInput =
        document.getElementById(
            "annualActivityTitle"
        );

    const dateInput =
        document.getElementById(
            "annualActivityDate"
        );

    const descriptionInput =
        document.getElementById(
            "annualActivityDescription"
        );

    const editIdInput =
        document.getElementById(
            "annualActivityEditId"
        );


    if (
        !titleInput ||
        !dateInput
    ) {
        return;
    }


    const title =
        titleInput.value.trim();

    const date =
        dateInput.value;

    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";

    const editId =
        editIdInput
            ? editIdInput.value
            : "";


    // =====================================
    // VALIDATION
    // =====================================

    if (!title) {

        alert(
            "Please enter an activity name."
        );

        return;
    }


    if (!date) {

        alert(
            "Please select an activity date."
        );

        return;
    }


    // =====================================
    // EDIT EXISTING
    // =====================================

    if (editId) {

        const index =
            annualActivities.findIndex(
                activity =>
                    String(activity.id) ===
                    String(editId)
            );


        if (index !== -1) {

            annualActivities[index] = {

                ...annualActivities[index],

                title,
                date,
                description

            };

        }

    }


    // =====================================
    // ADD NEW
    // =====================================

    else {

        const newActivity = {

            id: Date.now(),

            title,

            date,

            description

        };


        annualActivities.push(
            newActivity
        );

    }


    // =====================================
    // SWITCH YEAR AUTOMATICALLY
    // =====================================

    const activityYear =
        Number(
            date.substring(0, 4)
        );


    selectedAnnualActivityYear =
        activityYear;


    loadAnnualActivityYearSelector();

    renderAnnualActivities();


    // =====================================
    // CLOSE MODAL
    // =====================================

    closeAnnualActivityModal();

}

// =====================================================
// ANNUAL ACTIVITIES - SUPABASE READ
// =====================================================

async function loadAnnualActivitiesFromSupabase() {

    try {

        const { data, error } =
            await churchSupabase
                .from("annual_activities")
                .select("*")
                .order("activity_date", {
                    ascending: true
                });

        if (error) {

            console.error(
                "❌ Failed to load annual activities:",
                error
            );

            return false;
        }


        annualActivities =
            (data || []).map(activity => ({

                id:
                    activity.id,

                title:
                    activity.title || "",

                date:
                    activity.activity_date || "",

                description:
                    activity.description || ""

            }));


        console.log(
            "✅ Annual activities loaded from Supabase:",
            annualActivities
        );


        loadAnnualActivityYearSelector();

        renderAnnualActivities();


        return true;

    } catch (error) {

        console.error(
            "❌ Annual activities read error:",
            error
        );

        return false;
    }
}

// =====================================================
// ANNUAL ACTIVITIES - SUPABASE INSERT
// =====================================================

async function saveAnnualActivityToSupabase(activity) {

    try {

        const { data, error } =
            await churchSupabase
                .from("annual_activities")
                .insert([{

                    id:
                        activity.id,

                    title:
                        activity.title,

                    activity_date:
                        activity.date,

                    description:
                        activity.description || ""

                }])
                .select()
                .single();


        if (error) {

            console.error(
                "❌ Failed to save annual activity:",
                error
            );

            return null;
        }


        console.log(
            "✅ Annual activity saved to Supabase:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "❌ Annual activity insert error:",
            error
        );

        return null;
    }
}

// =====================================================
// SAVE ANNUAL ACTIVITY
// =====================================================

async function saveAnnualActivity() {

    if (!requireAdmin()) {
        return;
    }


    const titleInput =
        document.getElementById(
            "annualActivityTitle"
        );

    const dateInput =
        document.getElementById(
            "annualActivityDate"
        );

    const descriptionInput =
        document.getElementById(
            "annualActivityDescription"
        );

    const editIdInput =
        document.getElementById(
            "annualActivityEditId"
        );


    if (
        !titleInput ||
        !dateInput
    ) {
        return;
    }


    const title =
        titleInput.value.trim();

    const date =
        dateInput.value;

    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";

    const editId =
        editIdInput
            ? editIdInput.value
            : "";


    // =====================================
    // VALIDATION
    // =====================================

    if (!title) {

        alert(
            "Please enter an activity name."
        );

        return;
    }


    if (!date) {

        alert(
            "Please select an activity date."
        );

        return;
    }


    // =====================================
    // EDIT
    // Gagawin natin sa next step
    // =====================================

   if (editId) {

    const index =
        annualActivities.findIndex(
            activity =>
                String(activity.id) ===
                String(editId)
        );


    if (index === -1) {

        alert(
            "Activity was not found."
        );

        return;
    }


    const activityData = {

        id:
            annualActivities[index].id,

        title,

        date,

        description

    };


    const updatedActivity =
        await updateAnnualActivityToSupabase(
            activityData
        );


    if (!updatedActivity) {

        alert(
            "❌ Failed to update activity."
        );

        return;
    }


    annualActivities[index] = {

        id:
            updatedActivity.id,

        title:
            updatedActivity.title || "",

        date:
            updatedActivity.activity_date || "",

        description:
            updatedActivity.description || ""

    };

    // =====================================
// AUDIT - EDIT ANNUAL ACTIVITY
// =====================================

await writeAuditLog(
    "EDIT",
    "Annual Activities",
    `Updated annual activity: ${updatedActivity.title || title}`,
    updatedActivity.id,
    {
        title:
            updatedActivity.title || title,

        date:
            updatedActivity.activity_date || date,

        description:
            updatedActivity.description || description || ""
    }
);


    selectedAnnualActivityYear =
        Number(
            date.substring(0, 4)
        );


    loadAnnualActivityYearSelector();

    renderAnnualActivities();

    refreshDashboardStatus();

    closeAnnualActivityModal();


    alert(
        "✅ Activity updated successfully."
    );


    return;
}


    // =====================================
    // NEW ACTIVITY
    // =====================================

    const newActivity = {

        id:
            Date.now(),

        title,

        date,

        description

    };


    const savedActivity =
        await saveAnnualActivityToSupabase(
            newActivity
        );


    if (!savedActivity) {

        alert(
            "❌ Failed to save activity to Supabase."
        );

        return;
    }


    // =====================================
    // ADD TO LOCAL ARRAY
    // =====================================

    annualActivities.push({

        id:
            savedActivity.id,

        title:
            savedActivity.title || "",

        date:
            savedActivity.activity_date || "",

        description:
            savedActivity.description || ""

    });


    // =====================================
// AUDIT - ADD ANNUAL ACTIVITY
// =====================================

await writeAuditLog(
    "ADD",
    "Annual Activities",
    `Added annual activity: ${savedActivity.title || title}`,
    savedActivity.id,
    {
        title:
            savedActivity.title || title,

        date:
            savedActivity.activity_date || date,

        description:
            savedActivity.description || description || ""
    }
);

    // =====================================
    // SWITCH TO ACTIVITY YEAR
    // =====================================

    selectedAnnualActivityYear =
        Number(
            date.substring(0, 4)
        );


    loadAnnualActivityYearSelector();

    renderAnnualActivities();

    refreshDashboardStatus();

    closeAnnualActivityModal();


    alert(
        "✅ Annual activity saved successfully."
    );

}

// =====================================================
// ANNUAL ACTIVITIES - SUPABASE UPDATE
// =====================================================

async function updateAnnualActivityToSupabase(activity) {

    try {

        const { data, error } =
            await churchSupabase
                .from("annual_activities")
                .update({

                    title:
                        activity.title,

                    activity_date:
                        activity.date,

                    description:
                        activity.description || ""

                })
                .eq("id", activity.id)
                .select()
                .single();


        if (error) {

            console.error(
                "❌ Failed to update annual activity:",
                error
            );

            return null;
        }


        console.log(
            "✅ Annual activity updated in Supabase:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "❌ Annual activity update error:",
            error
        );

        return null;
    }
}

// =====================================================
// ANNUAL ACTIVITIES - SUPABASE DELETE
// =====================================================

async function deleteAnnualActivityFromSupabase(id) {

    try {

        const { error } =
            await churchSupabase
                .from("annual_activities")
                .delete()
                .eq("id", id);


        if (error) {

            console.error(
                "❌ Failed to delete annual activity:",
                error
            );

            return false;
        }


        console.log(
            "✅ Annual activity deleted from Supabase:",
            id
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Annual activity delete error:",
            error
        );

        return false;
    }
}

// =====================================================
// EDIT ANNUAL ACTIVITY
// =====================================================

function editAnnualActivity(id) {

    if (!requireAdmin()) {
        return;
    }


    const activity =
        annualActivities.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!activity) {

        alert(
            "Activity was not found."
        );

        return;
    }


    document.getElementById(
        "annualActivityModalTitle"
    ).textContent =
        "Edit Annual Activity";


    document.getElementById(
        "annualActivityTitle"
    ).value =
        activity.title || "";


    document.getElementById(
        "annualActivityDate"
    ).value =
        activity.date || "";


    document.getElementById(
        "annualActivityDescription"
    ).value =
        activity.description || "";


    document.getElementById(
        "annualActivityEditId"
    ).value =
        activity.id;


    document.getElementById(
        "annualActivityModal"
    ).classList.remove(
        "hidden"
    );
}

// =====================================================
// DELETE ANNUAL ACTIVITY
// =====================================================

async function deleteAnnualActivity(id) {

    if (!requireAdmin()) {
        return;
    }


    const activity =
        annualActivities.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!activity) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${activity.title}"?`
        );


    if (!confirmed) {
        return;
    }


    const deleted =
        await deleteAnnualActivityFromSupabase(
            id
        );


    if (!deleted) {


        alert(
            "❌ Failed to delete activity."
        );

        return;
    }


    // =====================================
// AUDIT - DELETE ANNUAL ACTIVITY
// =====================================

await writeAuditLog(
    "DELETE",
    "Annual Activities",
    `Deleted annual activity: ${activity.title || "Unknown Activity"}`,
    activity.id,
    {
        title:
            activity.title || "",

        date:
            activity.date || "",

        description:
            activity.description || ""
    }
);

    annualActivities =
        annualActivities.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    renderAnnualActivities();

    refreshDashboardStatus();


    alert(
        "✅ Activity deleted successfully."
    );

    if (
    typeof applyRoleBasedUI === "function"
) {
    applyRoleBasedUI();
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

        const saved =
            localStorage.getItem(
                "churchhq_tasks"
            );

        if (saved) {
            tasks =
                JSON.parse(saved);
        }

    } catch (e) {

        tasks = [];

    }


    const todoCol =
        document.getElementById(
            "todoColumn"
        );

    const progCol =
        document.getElementById(
            "progressColumn"
        );

    const compCol =
        document.getElementById(
            "completedColumn"
        );


    if (todoCol) {
        todoCol.innerHTML = "";
    }

    if (progCol) {
        progCol.innerHTML = "";
    }

    if (compCol) {
        compCol.innerHTML = "";
    }


    tasks.forEach(
        task =>
            renderTask(task)
    );


    updateCounters();


    // =====================================
    // RE-APPLY ROLE UI TO NEW TASK CARDS
    // =====================================

    applyRoleBasedUI();

}

function renderTask(task) {

    const card =
        document.createElement("div");

    card.className = "task-card";


    // =====================================
    // PRIORITY
    // =====================================

    let priorityClass = "low";

    if (task.priority === "High") {
        priorityClass = "high";
    }

    if (task.priority === "Medium") {
        priorityClass = "medium";
    }


    // =====================================
    // OVERDUE CHECK
    // =====================================

    let isOverdue = false;
    let overdueDays = 0;


    const normalizedStatus =
        String(task.status || "")
            .trim()
            .toLowerCase();


    if (
        task.dueDate &&
        normalizedStatus !== "completed"
    ) {

        const dueDate =
            new Date(
                `${task.dueDate}T00:00:00`
            );


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        if (
            !isNaN(dueDate.getTime()) &&
            dueDate < today
        ) {

            isOverdue = true;


            overdueDays =
                Math.floor(
                    (
                        today.getTime() -
                        dueDate.getTime()
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );

        }

    }


    // =====================================
    // TASK CARD
    // =====================================

    card.innerHTML = `

        <div
    style="
        display:flex;
        align-items:flex-start;
        gap:10px;
        width:100%;
    "
>

    <h4
        style="
            margin:0;
            flex:1;
            min-width:0;
            overflow-wrap:anywhere;
            word-break:break-word;
        "
    >
        ${task.title}
    </h4>


           <div
    style="
        display:flex;
        gap:6px;
        align-items:center;
        flex-shrink:0;
    "
>

                <button
                    type="button"
                    data-admin-only="true"
                    onclick="openEditTaskModal(${task.id})"
                    style="
                        background:none;
                        border:none;
                        color:#2563eb;
                        cursor:pointer;
                        font-size:18px;
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:50%;
                    "
                    title="Edit"
                >
                    ✏️
                </button>


                <button
                    type="button"
                    data-admin-only="true"
                    onclick="deleteTask(${task.id})"
                    style="
                        background:none;
                        border:none;
                        color:#ef4444;
                        cursor:pointer;
                        font-weight:bold;
                        font-size:20px;
width:36px;
height:36px;
display:flex;
align-items:center;
justify-content:center;
border-radius:50%;
                    "
                    title="Delete"
                >
                    &times;
                </button>

            </div>

        </div>


        <p>
            ${task.description || "<i>No description</i>"}
        </p>


        <p>
            📂 ${task.category || "-"}
        </p>

        <p>
            👤 Assigned to:
            <strong>
                ${task.assignedTo || "Unassigned"}
            </strong>
        </p>

        <p>
            📅 ${task.dueDate || "-"}
        </p>


        ${
            isOverdue
                ? `
                    <div class="task-overdue-badge">
                        ⚠ OVERDUE
                        ${
                            overdueDays > 0
                                ? `• ${overdueDays} day${overdueDays === 1 ? "" : "s"}`
                                : ""
                        }
                    </div>
                `
                : ""
        }


        <span class="priority ${priorityClass}">
            ${task.priority}
        </span>

    `;


    // =====================================
    // PLACE IN CORRECT COLUMN
    // =====================================

    if (
        normalizedStatus === "todo" &&
        document.getElementById(
            "todoColumn"
        )
    ) {

        document
            .getElementById(
                "todoColumn"
            )
            .appendChild(card);

    }

    else if (
        normalizedStatus === "progress" &&
        document.getElementById(
            "progressColumn"
        )
    ) {

        document
            .getElementById(
                "progressColumn"
            )
            .appendChild(card);

    }

    else if (
        normalizedStatus === "completed" &&
        document.getElementById(
            "completedColumn"
        )
    ) {

        document
            .getElementById(
                "completedColumn"
            )
            .appendChild(card);

    }


    applyRoleBasedUI();

}

async function deleteTask(id) {

    if (!requireAdmin()) {
        return;
    }


    // =====================================
    // GET TASK BEFORE DELETE
    // =====================================

    const taskToDelete =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    const deletedTaskTitle =
        taskToDelete
            ? taskToDelete.title
            : "Unknown Task";


    if (
        !confirm(
            "Are you sure you want to delete this task?"
        )
    ) {
        return;
    }


    // =====================================
    // DELETE FROM SUPABASE
    // =====================================

    const deletedFromSupabase =
        await deleteTaskFromSupabase(
            id
        );


    if (!deletedFromSupabase) {

        alert(
            "❌ Task was not deleted from Supabase."
        );

        return;
    }


    // =====================================
    // AUDIT - DELETE PLANNER TASK
    // =====================================

    await writeAuditLog(
        "DELETE",
        "Planner",
        `Deleted task: ${deletedTaskTitle}`,
        id,
        {
            title:
                deletedTaskTitle,

            category:
                taskToDelete?.category || "",

            priority:
                taskToDelete?.priority || "",

            dueDate:
                taskToDelete?.dueDate || "",

            assignedTo:
                taskToDelete?.assignedTo || ""
        }
    );


    // =====================================
    // REMOVE FROM LOCAL DATA
    // =====================================

    tasks =
        tasks.filter(
            task =>
                String(task.id) !==
                String(id)
        );


    saveToLocalStorage();

    loadSavedTasks();

    refreshDashboardStatus();


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

    const assigneeSearch =
    document.getElementById(
        "taskAssigneeSearch"
    );

const assigneeSelect =
    document.getElementById(
        "taskAssignedTo"
    );


if (assigneeSearch) {
    assigneeSearch.value = "";
}


if (assigneeSelect) {

    assigneeSelect.innerHTML = "";

    assigneeSelect.style.display =
        "none";

}
}



// =====================================================
// PROGRAM PLANNER
// BASIC STATE + TABS
// =====================================================

let currentProgramType =
    "sunday";

let editingProgramId =
    null;

let programItems =
    [];

let programPlans =
    [];

// =====================================================
// SWITCH PROGRAM TYPE
// =====================================================

function switchProgramPlannerTab(type) {

    currentProgramType =
        type;


    const sundayTab =
        document.getElementById(
            "programTabSunday"
        );

    const midweekTab =
        document.getElementById(
            "programTabMidweek"
        );

    const specialTab =
        document.getElementById(
            "programTabSpecial"
        );


    const eventNameGroup =
        document.getElementById(
            "programEventNameGroup"
        );


    const savedTitle =
        document.getElementById(
            "programSavedTitle"
        );


    // RESET ACTIVE TAB

    [
        sundayTab,
        midweekTab,
        specialTab
    ].forEach(tab => {

        if (tab) {

            tab.classList.remove(
                "active"
            );

        }

    });


    // SUNDAY

    if (type === "sunday") {

        if (sundayTab) {

            sundayTab.classList.add(
                "active"
            );

        }


        if (eventNameGroup) {

            eventNameGroup.classList.add(
                "hidden"
            );

        }


        if (savedTitle) {

            savedTitle.textContent =
                "Saved Sunday Service Programs";

        }

    }


    // MIDWEEK

    else if (type === "midweek") {

        if (midweekTab) {

            midweekTab.classList.add(
                "active"
            );

        }


        if (eventNameGroup) {

            eventNameGroup.classList.add(
                "hidden"
            );

        }


        if (savedTitle) {

            savedTitle.textContent =
                "Saved Midweek Service Programs";

        }

    }


    // SPECIAL EVENT

    else if (type === "special") {

        if (specialTab) {

            specialTab.classList.add(
                "active"
            );

        }


        if (eventNameGroup) {

            eventNameGroup.classList.remove(
                "hidden"
            );

        }


        if (savedTitle) {

            savedTitle.textContent =
                "Saved Special Event Programs";

        }

    }


    // Later this will load records
    // from Supabase.

    if (
        typeof loadProgramPlans ===
        "function"
    ) {

        loadProgramPlans();

    }

}


// =====================================================
// NEW PROGRAM
// =====================================================

function newProgramPlan() {

    if (!isAdminUser()) {
        return;
    }


    editingProgramId =
        null;


    programItems =
        [];


    const dateInput =
        document.getElementById(
            "programDate"
        );


    const eventInput =
        document.getElementById(
            "programEventName"
        );


    if (dateInput) {

        dateInput.value =
            "";

    }


    if (eventInput) {

        eventInput.value =
            "";

    }


    renderProgramItems();

}

// =====================================================
// CLEAR PROGRAM EDITOR
// =====================================================

function clearProgramEditor() {

    newProgramPlan();

}




// =====================================================
// ADD PROGRAM ITEM
// =====================================================

function addProgramItem() {

    if (!isAdminUser()) {
        return;
    }

    const item = {

        tempId:
            Date.now() +
            Math.floor(
                Math.random() * 1000
            ),

        itemName:
            "",

        memberId:
            null,

        memberName:
            ""

    };


    programItems.push(
        item
    );


    renderProgramItems();

}


// =====================================================
// RENDER PROGRAM ITEMS
// =====================================================

function renderProgramItems() {

    const container =
        document.getElementById(
            "programItemsList"
        );


    if (!container) {
        return;
    }


    // =====================================
    // EMPTY STATE
    // =====================================

    if (
        !programItems ||
        programItems.length === 0
    ) {

        container.innerHTML = `
            <div class="program-empty-state">
                No program items yet.
            </div>
        `;

        return;

    }


    container.innerHTML = "";


    programItems.forEach(
        (item, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "program-item-row";


            // =====================================
            // ORDER
            // =====================================

            const order =
                document.createElement(
                    "div"
                );

            order.className =
                "program-item-order";

            order.textContent =
                index + 1;


            // =====================================
            // PROGRAM ITEM NAME
            // =====================================

            const itemField =
                document.createElement(
                    "div"
                );

            itemField.className =
                "program-item-field";


            const itemLabel =
                document.createElement(
                    "label"
                );

            itemLabel.textContent =
                "Program Item";


            const itemInput =
                document.createElement(
                    "input"
                );

            itemInput.type =
                "text";

            itemInput.placeholder =
                "Example: Opening Prayer";

            itemInput.value =
                item.itemName || "";


            itemInput.disabled =
                !isAdminUser();


            itemInput.addEventListener(
                "input",
                event => {

                    item.itemName =
                        event.target.value;

                }
            );


            itemField.appendChild(
                itemLabel
            );

            itemField.appendChild(
                itemInput
            );


            // =====================================
// ASSIGNED MEMBER - SEARCHABLE
// =====================================

const memberField =
    document.createElement(
        "div"
    );

memberField.className =
    "program-item-field program-member-field";


const memberLabel =
    document.createElement(
        "label"
    );

memberLabel.textContent =
    "Assigned Member";


const searchWrap =
    document.createElement(
        "div"
    );

searchWrap.className =
    "program-member-search-wrap";


// =====================================
// SEARCH INPUT
// =====================================

const memberSearch =
    document.createElement(
        "input"
    );

memberSearch.type =
    "text";

memberSearch.placeholder =
    "Search member...";

memberSearch.autocomplete =
    "off";

memberSearch.value =
    item.memberName || "";

memberSearch.disabled =
    !isAdminUser();


// =====================================
// RESULTS DROPDOWN
// =====================================

const resultsBox =
    document.createElement(
        "div"
    );

resultsBox.className =
    "program-member-results hidden";


// =====================================
// SHOW MATCHING MEMBERS
// =====================================

function showMemberResults(
    searchText = ""
) {

    if (!isAdminUser()) {
        return;
    }


    const query =
        String(
            searchText || ""
        )
        .trim()
        .toLowerCase();


    const sortedMembers =
        [...members]
        .sort(
            (a, b) =>
                String(
                    a.name || ""
                )
                .localeCompare(
                    String(
                        b.name || ""
                    ),
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                )
        );


    const matches =
        sortedMembers
        .filter(member => {

            const name =
                String(
                    member.name || ""
                )
                .toLowerCase();


            return (
                !query ||
                name.includes(
                    query
                )
            );

        })
        .slice(
            0,
            10
        );


    resultsBox.innerHTML =
        "";


    if (
        matches.length === 0
    ) {

        resultsBox.innerHTML = `
            <div class="program-member-no-result">
                No member found.
            </div>
        `;

        resultsBox.classList.remove(
            "hidden"
        );

        return;

    }


    matches.forEach(
        member => {

            const option =
                document.createElement(
                    "button"
                );

            option.type =
                "button";

            option.className =
                "program-member-result";


            option.textContent =
                member.name ||
                "Unnamed Member";


            option.addEventListener(
                "click",
                () => {

                    item.memberId =
                        member.id;

                    item.memberName =
                        member.name || "";


                    memberSearch.value =
                        item.memberName;


                    resultsBox.classList.add(
                        "hidden"
                    );

                }
            );


            resultsBox.appendChild(
                option
            );

        }
    );


    resultsBox.classList.remove(
        "hidden"
    );

}


// =====================================
// SEARCH EVENTS
// =====================================

memberSearch.addEventListener(
    "focus",
    () => {

        showMemberResults(
            memberSearch.value
        );

    }
);


memberSearch.addEventListener(
    "input",
    event => {

        const value =
            event.target.value;


        // Clear previous selected member
        // kapag binago ulit ang text.

        item.memberId =
            null;

        item.memberName =
            value;


        showMemberResults(
            value
        );

    }
);


// =====================================
// CLOSE RESULTS WHEN CLICKING OUTSIDE
// =====================================

document.addEventListener(
    "click",
    event => {

        if (
            !searchWrap.contains(
                event.target
            )
        ) {

            resultsBox.classList.add(
                "hidden"
            );

        }

    }
);


// =====================================
// BUILD MEMBER FIELD
// =====================================

searchWrap.appendChild(
    memberSearch
);

searchWrap.appendChild(
    resultsBox
);

memberField.appendChild(
    memberLabel
);

memberField.appendChild(
    searchWrap
);

            // =====================================
            // ACTION BUTTONS
            // =====================================

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "program-item-actions";


            // MOVE UP

            const upButton =
                document.createElement(
                    "button"
                );

            upButton.type =
                "button";

            upButton.className =
                "program-item-icon-btn";

            upButton.title =
                "Move Up";

            upButton.innerHTML =
                "↑";


            upButton.disabled =
                index === 0;


            upButton.onclick =
                () => {

                    moveProgramItem(
                        index,
                        -1
                    );

                };


            // MOVE DOWN

            const downButton =
                document.createElement(
                    "button"
                );

            downButton.type =
                "button";

            downButton.className =
                "program-item-icon-btn";

            downButton.title =
                "Move Down";

            downButton.innerHTML =
                "↓";


            downButton.disabled =
                index ===
                programItems.length - 1;


            downButton.onclick =
                () => {

                    moveProgramItem(
                        index,
                        1
                    );

                };


            // DELETE

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "program-item-icon-btn delete";

            deleteButton.title =
                "Delete Item";

            deleteButton.innerHTML =
                "×";


            deleteButton.onclick =
                () => {

                    deleteProgramItem(
                        index
                    );

                };


            // ATTENDANCE = VIEW ONLY

            if (!isAdminUser()) {

                actions.style.display =
                    "none";

            }


            actions.appendChild(
                upButton
            );

            actions.appendChild(
                downButton
            );

            actions.appendChild(
                deleteButton
            );


            // =====================================
            // BUILD ROW
            // =====================================

            row.appendChild(
                order
            );

            row.appendChild(
                itemField
            );

            row.appendChild(
                memberField
            );

            row.appendChild(
                actions
            );


            container.appendChild(
                row
            );

        }
    );

}


// =====================================================
// MOVE PROGRAM ITEM
// =====================================================

function moveProgramItem(
    index,
    direction
) {

    if (!isAdminUser()) {
        return;
    }


    const newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >=
            programItems.length
    ) {

        return;

    }


    const temp =
        programItems[index];


    programItems[index] =
        programItems[newIndex];


    programItems[newIndex] =
        temp;


    renderProgramItems();

}


// =====================================================
// DELETE PROGRAM ITEM
// =====================================================

function deleteProgramItem(index) {

    if (!isAdminUser()) {
        return;
    }


    programItems.splice(
        index,
        1
    );


    renderProgramItems();

}

// =====================================================
// DEFAULT PROGRAM ITEMS
// =====================================================

function loadDefaultProgramItems() {

    if (!isAdminUser()) {
        return;
    }


    let defaults = [];


    // =====================================
    // SUNDAY
    // =====================================

    if (
        currentProgramType ===
        "sunday"
    ) {

        defaults = [

            "Opening Prayer",

            "Praise & Worship",

            "Welcome",

            "Offering",

            "Message",

            "Announcements",

            "Closing Prayer"

        ];

    }


    // =====================================
    // MIDWEEK
    // =====================================

    else if (
        currentProgramType ===
        "midweek"
    ) {

        defaults = [

            "Opening Prayer",

            "Praise & Worship",

            "Devotion / Message",

            "Prayer Time",

            "Announcements",

            "Closing Prayer"

        ];

    }


    // =====================================
    // SPECIAL EVENT
    // =====================================

    else {

        defaults = [

            "Opening Prayer",

            "Welcome",

            "Praise & Worship",

            "Special Number",

            "Message",

            "Announcements",

            "Closing Prayer"

        ];

    }


    programItems =
        defaults.map(
            (name, index) => ({

                tempId:
                    Date.now() +
                    index,

                itemName:
                    name,

                memberId:
                    null,

                memberName:
                    ""

            })
        );


    renderProgramItems();

}


// =====================================================
// PROGRAM PLANNER - SAVE / UPDATE
// =====================================================

async function saveProgramPlan() {

    if (!isAdminUser()) {
        return;
    }


    const dateInput =
        document.getElementById(
            "programDate"
        );

    const eventInput =
        document.getElementById(
            "programEventName"
        );


    const programDate =
        dateInput
            ? dateInput.value
            : "";


    const eventName =
        eventInput
            ? eventInput.value.trim()
            : "";


    // =====================================
    // VALIDATION
    // =====================================

    if (!programDate) {

        alert(
            "Please select a program date."
        );

        return;
    }


    if (
        currentProgramType ===
            "special" &&
        !eventName
    ) {

        alert(
            "Please enter the special event name."
        );

        return;
    }


    if (
        !Array.isArray(programItems) ||
        programItems.length === 0
    ) {

        alert(
            "Please add at least one program item."
        );

        return;
    }


    const cleanedItems =
        programItems
            .map(
                (item, index) => ({

                    item_order:
                        index + 1,

                    item_name:
                        String(
                            item.itemName || ""
                        ).trim(),

                    member_id:
                        item.memberId ||
                        null,

                    member_name:
                        String(
                            item.memberName || ""
                        ).trim()

                })
            )
            .filter(
                item =>
                    item.item_name
            );


    if (
        cleanedItems.length === 0
    ) {

        alert(
            "Please enter at least one valid program item."
        );

        return;
    }


    try {

        // =====================================================
        // EDIT EXISTING PROGRAM
        // =====================================================

        if (editingProgramId) {

            const programId =
                editingProgramId;


            // -------------------------------------
            // UPDATE MAIN PROGRAM
            // -------------------------------------

            const {
                error: updateError
            } =
                await churchSupabase
                    .from(
                        "program_plans"
                    )
                    .update({

                        program_type:
                            currentProgramType,

                        program_date:
                            programDate,

                        event_name:
                            currentProgramType ===
                                "special"
                                ? eventName
                                : null,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        programId
                    );


            if (updateError) {

                console.error(
                    "❌ Failed to update program:",
                    updateError
                );


                alert(
                    "❌ Program was not updated."
                );

                return;
            }


            // -------------------------------------
            // DELETE OLD ITEMS
            // -------------------------------------

            const {
                error: deleteItemsError
            } =
                await churchSupabase
                    .from(
                        "program_items"
                    )
                    .delete()
                    .eq(
                        "program_id",
                        programId
                    );


            if (deleteItemsError) {

                console.error(
                    "❌ Failed to remove old program items:",
                    deleteItemsError
                );

                alert(
                    "❌ Failed to update program items."
                );

                return;
            }


            // -------------------------------------
            // INSERT UPDATED ITEMS
            // -------------------------------------

            const updatedItems =
                cleanedItems.map(
                    item => ({

                        program_id:
                            programId,

                        item_order:
                            item.item_order,

                        item_name:
                            item.item_name,

                        member_id:
                            item.member_id,

                        member_name:
                            item.member_name

                    })
                );


            const {
                error: insertItemsError
            } =
                await churchSupabase
                    .from(
                        "program_items"
                    )
                    .insert(
                        updatedItems
                    );


            if (insertItemsError) {

                console.error(
                    "❌ Failed to insert updated items:",
                    insertItemsError
                );

                alert(
                    "❌ Updated program items were not saved."
                );

                return;
            }


            console.log(
                "✅ Program updated:",
                programId
            );

            // =====================================================
// AUDIT - EDIT PROGRAM
// =====================================================

await writeAuditLog(
    "EDIT",
    "Program Planner",
    `Updated ${currentProgramType} program for ${programDate}`,
    programId,
    {
        programType:
            currentProgramType,

        programDate:
            programDate,

        eventName:
            eventName || "",

        totalItems:
            cleanedItems.length
    }
);

            alert(
                "✅ Program updated successfully."
            );

        }


        // =====================================================
        // ADD NEW PROGRAM
        // =====================================================

        else {

            const {
                data: planData,
                error: planError
            } =
                await churchSupabase
                    .from(
                        "program_plans"
                    )
                    .insert([
                        {

                            program_type:
                                currentProgramType,

                            program_date:
                                programDate,

                            event_name:
                                currentProgramType ===
                                    "special"
                                    ? eventName
                                    : null,

                            updated_at:
                                new Date()
                                    .toISOString()

                        }
                    ])
                    .select()
                    .single();


            if (planError) {

                console.error(
                    "❌ Failed to save program plan:",
                    planError
                );

                alert(
                    "❌ Program plan was not saved."
                );

                return;
            }


            if (!planData) {
                return;
            }


            const itemsToInsert =
                cleanedItems.map(
                    item => ({

                        program_id:
                            planData.id,

                        item_order:
                            item.item_order,

                        item_name:
                            item.item_name,

                        member_id:
                            item.member_id,

                        member_name:
                            item.member_name

                    })
                );


            const {
                error: itemsError
            } =
                await churchSupabase
                    .from(
                        "program_items"
                    )
                    .insert(
                        itemsToInsert
                    );


            if (itemsError) {

                console.error(
                    "❌ Failed to save program items:",
                    itemsError
                );


                await churchSupabase
                    .from(
                        "program_plans"
                    )
                    .delete()
                    .eq(
                        "id",
                        planData.id
                    );


                alert(
                    "❌ Program items were not saved."
                );

                return;
            }


            console.log(
                "✅ Program saved:",
                planData
            );

            // =====================================================
// AUDIT - ADD PROGRAM
// =====================================================

await writeAuditLog(
    "ADD",
    "Program Planner",
    `Added ${currentProgramType} program for ${programDate}`,
    planData.id,
    {
        programType:
            currentProgramType,

        programDate:
            programDate,

        eventName:
            eventName || "",

        totalItems:
            cleanedItems.length
    }
);

            alert(
                "✅ Program saved successfully."
            );

        }


        // =====================================================
        // RESET EDITOR
        // =====================================================

        editingProgramId =
            null;


        programItems =
            [];


        if (dateInput) {

            dateInput.value =
                "";

        }


        if (eventInput) {

            eventInput.value =
                "";

        }


        const saveButton =
            document.querySelector(
                '#program-planner button[onclick="saveProgramPlan()"]'
            );


        if (saveButton) {

            saveButton.textContent =
                "Save Program";

        }


        renderProgramItems();


        await loadProgramPlans();


    } catch (error) {

        console.error(
            "❌ Program Planner save/update error:",
            error
        );


        alert(
            "❌ Failed to save program."
        );

    }

}

// =====================================================
// PROGRAM PLANNER - FAST SUPABASE LOAD
// 2 DATABASE REQUESTS ONLY
// =====================================================

async function loadProgramPlans() {

    const body =
        document.getElementById(
            "programHistoryBody"
        );


    // =====================================
    // SHOW LOADING STATE
    // =====================================

    if (body) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        padding:25px;
                        text-align:center;
                        color:#6f7780;
                    "
                >
                    Loading programs...
                </td>

            </tr>

        `;

    }


    try {

        // =====================================
        // 1. LOAD PROGRAM PLANS
        // =====================================

        const {
            data: plans,
            error: plansError
        } =
            await churchSupabase
                .from(
                    "program_plans"
                )
                .select("*")
                .eq(
                    "program_type",
                    currentProgramType
                )
                .order(
                    "program_date",
                    {
                        ascending:
                            false
                    }
                );


        if (plansError) {

            console.error(
                "❌ Failed to load program plans:",
                plansError
            );

            programPlans =
                [];

            renderProgramHistory();

            return false;

        }


        const safePlans =
            Array.isArray(plans)
                ? plans
                : [];


        // =====================================
        // NO PROGRAMS
        // =====================================

        if (
            safePlans.length === 0
        ) {

            programPlans =
                [];

            renderProgramHistory();

            return true;

        }


        // =====================================
        // GET ALL PROGRAM IDS
        // =====================================

        const programIds =
            safePlans.map(
                plan =>
                    plan.id
            );


        // =====================================
        // 2. LOAD ALL ITEMS IN ONE QUERY
        // =====================================

        const {
            data: allItems,
            error: itemsError
        } =
            await churchSupabase
                .from(
                    "program_items"
                )
                .select("*")
                .in(
                    "program_id",
                    programIds
                )
                .order(
                    "item_order",
                    {
                        ascending:
                            true
                    }
                );


        if (itemsError) {

            console.error(
                "❌ Failed to load program items:",
                itemsError
            );

        }


        const safeItems =
            Array.isArray(allItems)
                ? allItems
                : [];


        // =====================================
        // GROUP ITEMS BY PROGRAM ID
        // =====================================

        const itemsByProgram =
            {};


        safeItems.forEach(
            item => {

                const key =
                    String(
                        item.program_id
                    );


                if (
                    !itemsByProgram[key]
                ) {

                    itemsByProgram[key] =
                        [];

                }


                itemsByProgram[key].push(
                    item
                );

            }
        );


        // =====================================
        // COMBINE PLANS + ITEMS
        // =====================================

        programPlans =
            safePlans.map(
                plan => ({

                    ...plan,

                    items:
                        itemsByProgram[
                            String(
                                plan.id
                            )
                        ] || []

                })
            );


        console.log(
            "⚡ Program plans loaded:",
            programPlans.length,
            "programs /",
            safeItems.length,
            "items"
        );


        // =====================================
        // RENDER
        // =====================================

        renderProgramHistory();


        return true;

    } catch (error) {

        console.error(
            "❌ Program Planner read error:",
            error
        );


        programPlans =
            [];

        renderProgramHistory();


        return false;

    }

}

// =====================================================
// PROGRAM PLANNER - HISTORY
// =====================================================

function renderProgramHistory() {

    const body =
        document.getElementById(
            "programHistoryBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML =
        "";


    // =====================================
    // EMPTY
    // =====================================

    if (
        !Array.isArray(programPlans) ||
        programPlans.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="program-empty-table"
                >
                    No saved programs.
                </td>

            </tr>

        `;

        return;

    }


    // =====================================
    // RECORDS
    // =====================================

    programPlans.forEach(
        plan => {

            const tr =
                document.createElement(
                    "tr"
                );


            // =====================================
            // FORMAT DATE
            // =====================================

            let formattedDate =
                plan.program_date ||
                "-";


            if (plan.program_date) {

                const d =
                    new Date(
                        plan.program_date +
                        "T00:00:00"
                    );


                if (
                    !isNaN(
                        d.getTime()
                    )
                ) {

                    formattedDate =
                        d.toLocaleDateString(
                            "en-US",
                            {
                                month:
                                    "short",

                                day:
                                    "numeric",

                                year:
                                    "numeric"
                            }
                        );

                }

            }


            // =====================================
            // PROGRAM NAME
            // =====================================

            let programName =
                "Sunday Service";


            if (
                plan.program_type ===
                "midweek"
            ) {

                programName =
                    "Midweek Service";

            }


            if (
                plan.program_type ===
                "special"
            ) {

                programName =
                    plan.event_name ||
                    "Special Event";

            }


            // =====================================
            // ITEM COUNT
            // =====================================

            const itemCount =
                Array.isArray(
                    plan.items
                )
                    ? plan.items.length
                    : 0;


            // =====================================
            // ACTIONS
            // =====================================

            let actionsHTML = `

                <button
                    type="button"
                    class="secondary-btn"
                    style="
                        padding:5px 9px;
                        font-size:12px;
                    "
                    onclick="viewProgramPlan(${plan.id})"
                >
                    👁 View
                </button>

            `;


            // Admin only later gets Edit/Delete
            if (isAdminUser()) {

                actionsHTML += `

                    <button
                        type="button"
                        class="secondary-btn"
                        style="
                            padding:5px 9px;
                            font-size:12px;
                        "
                        onclick="editProgramPlan(${plan.id})"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        type="button"
                        class="secondary-btn"
                        style="
                            padding:5px 9px;
                            font-size:12px;
                            color:#dc2626;
                            border-color:#fca5a5;
                        "
                        onclick="deleteProgramPlan(${plan.id})"
                    >
                        × Delete
                    </button>

                `;

            }


            tr.innerHTML = `

                <td>
                    ${formattedDate}
                </td>


                <td>
                    <strong>
                        ${programName}
                    </strong>
                </td>


                <td>
                    ${itemCount}
                    item${itemCount === 1 ? "" : "s"}
                </td>


                <td>

                    <div
                        style="
                            display:flex;
                            gap:6px;
                            flex-wrap:wrap;
                        "
                    >

                        ${actionsHTML}

                    </div>

                </td>

            `;


            body.appendChild(
                tr
            );

        }
    );

}

// =====================================================
// PROGRAM PLANNER - VIEW MODAL
// =====================================================

function viewProgramPlan(programId) {

    const plan =
        programPlans.find(
            record =>
                String(record.id) ===
                String(programId)
        );


    if (!plan) {

        console.warn(
            "Program not found:",
            programId
        );

        return;

    }


    const modal =
        document.getElementById(
            "viewProgramModal"
        );

    const title =
        document.getElementById(
            "viewProgramTitle"
        );

    const subtitle =
        document.getElementById(
            "viewProgramSubtitle"
        );

    const itemsContainer =
        document.getElementById(
            "viewProgramItems"
        );


    if (
        !modal ||
        !title ||
        !subtitle ||
        !itemsContainer
    ) {
        return;
    }


    // =====================================
    // PROGRAM NAME
    // =====================================

    let programName =
        "Sunday Service Program";


    if (
        plan.program_type ===
        "midweek"
    ) {

        programName =
            "Midweek Service Program";

    }


    if (
        plan.program_type ===
        "special"
    ) {

        programName =
            plan.event_name ||
            "Special Event Program";

    }


    title.textContent =
        programName;


    // =====================================
    // DATE
    // =====================================

    let formattedDate =
        plan.program_date ||
        "-";


    if (plan.program_date) {

        const d =
            new Date(
                plan.program_date +
                "T00:00:00"
            );


        if (!isNaN(d.getTime())) {

            formattedDate =
                d.toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    }
                );

        }

    }


    subtitle.textContent =
        formattedDate;


    // =====================================
    // ITEMS
    // =====================================

    itemsContainer.innerHTML =
        "";


    const items =
        Array.isArray(plan.items)
            ? [...plan.items]
            : [];


    items.sort(
        (a, b) =>
            Number(a.item_order || 0) -
            Number(b.item_order || 0)
    );


    if (items.length === 0) {

        itemsContainer.innerHTML = `

            <div class="program-empty-state">
                No program items found.
            </div>

        `;

    } else {

        items.forEach(
            item => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "program-view-item";


                row.innerHTML = `

                    <div class="program-view-order">
                        ${item.item_order || ""}
                    </div>


                    <div class="program-view-info">

                        <strong>
                            ${item.item_name || "-"}
                        </strong>

                        <span>
                            ${item.member_name || "Unassigned"}
                        </span>

                    </div>

                `;


                itemsContainer.appendChild(
                    row
                );

            }
        );

    }


    modal.classList.remove(
        "hidden"
    );

}


// =====================================================
// CLOSE VIEW PROGRAM MODAL
// =====================================================

function closeViewProgramModal() {

    const modal =
        document.getElementById(
            "viewProgramModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}

// =====================================================
// PROGRAM PLANNER - EDIT EXISTING PROGRAM
// =====================================================

function editProgramPlan(programId) {

    if (!isAdminUser()) {
        return;
    }


    const plan =
        programPlans.find(
            record =>
                String(record.id) ===
                String(programId)
        );


    if (!plan) {

        alert(
            "Program record was not found."
        );

        return;
    }


    // =====================================
    // SET EDIT MODE
    // =====================================

    editingProgramId =
        plan.id;


    currentProgramType =
        plan.program_type ||
        "sunday";


 // =====================================
// SWITCH TO CORRECT TAB
// Visual only — no Supabase reload
// =====================================

const sundayTab =
    document.getElementById(
        "programTabSunday"
    );

const midweekTab =
    document.getElementById(
        "programTabMidweek"
    );

const specialTab =
    document.getElementById(
        "programTabSpecial"
    );

const eventNameGroup =
    document.getElementById(
        "programEventNameGroup"
    );


[
    sundayTab,
    midweekTab,
    specialTab
].forEach(tab => {

    if (tab) {

        tab.classList.remove(
            "active"
        );

    }

});


if (
    currentProgramType ===
    "sunday"
) {

    if (sundayTab) {
        sundayTab.classList.add(
            "active"
        );
    }

    if (eventNameGroup) {
        eventNameGroup.classList.add(
            "hidden"
        );
    }

}

else if (
    currentProgramType ===
    "midweek"
) {

    if (midweekTab) {
        midweekTab.classList.add(
            "active"
        );
    }

    if (eventNameGroup) {
        eventNameGroup.classList.add(
            "hidden"
        );
    }

}

else {

    if (specialTab) {
        specialTab.classList.add(
            "active"
        );
    }

    if (eventNameGroup) {
        eventNameGroup.classList.remove(
            "hidden"
        );
    }

}

    // =====================================
    // LOAD DATE
    // =====================================

    const dateInput =
        document.getElementById(
            "programDate"
        );


    if (dateInput) {

        dateInput.value =
            plan.program_date ||
            "";

    }


    // =====================================
    // LOAD SPECIAL EVENT NAME
    // =====================================

    const eventInput =
        document.getElementById(
            "programEventName"
        );


    if (eventInput) {

        eventInput.value =
            plan.event_name ||
            "";

    }


    // =====================================
    // LOAD PROGRAM ITEMS
    // =====================================

    const savedItems =
        Array.isArray(plan.items)
            ? [...plan.items]
            : [];


    savedItems.sort(
        (a, b) =>
            Number(
                a.item_order || 0
            ) -
            Number(
                b.item_order || 0
            )
    );


    programItems =
        savedItems.map(
            item => ({

                id:
                    item.id,

                tempId:
                    item.id,

                itemName:
                    item.item_name ||
                    "",

                memberId:
                    item.member_id ||
                    null,

                memberName:
                    item.member_name ||
                    ""

            })
        );


    renderProgramItems();


    // =====================================
    // CHANGE SAVE BUTTON TEXT
    // =====================================

    const saveButton =
        document.querySelector(
            '#program-planner button[onclick="saveProgramPlan()"]'
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Program";

    }


    // =====================================
    // SCROLL TO EDITOR
    // =====================================

    const editor =
        document.querySelector(
            "#program-planner .program-planner-card"
        );


    if (editor) {

        editor.scrollIntoView({
            behavior:
                "smooth",

            block:
                "start"
        });

    }

}

// =====================================================
// PROGRAM PLANNER - DELETE PROGRAM
// =====================================================

async function deleteProgramPlan(programId) {

    if (!isAdminUser()) {
        return;
    }


    // =====================================
    // FIND PROGRAM
    // =====================================

    const plan =
        programPlans.find(
            record =>
                String(record.id) ===
                String(programId)
        );


    if (!plan) {

        alert(
            "Program record was not found."
        );

        return;
    }


    // =====================================
    // PROGRAM NAME
    // =====================================

    let programName =
        "Sunday Service Program";


    if (
        plan.program_type ===
        "midweek"
    ) {

        programName =
            "Midweek Service Program";

    }


    if (
        plan.program_type ===
        "special"
    ) {

        programName =
            plan.event_name ||
            "Special Event Program";

    }


    // =====================================
    // CONFIRM DELETE
    // =====================================

    const confirmed =
        confirm(
            `Delete "${programName}"?\n\n` +
            `Date: ${plan.program_date || "-"}\n\n` +
            `All program items and assignments ` +
            `inside this program will also be deleted.`
        );


    if (!confirmed) {
        return;
    }


    try {

        // =====================================
        // DELETE MAIN PROGRAM
        // =====================================

        const {
            error
        } =
            await churchSupabase
                .from(
                    "program_plans"
                )
                .delete()
                .eq(
                    "id",
                    programId
                );


        if (error) {

            console.error(
                "❌ Failed to delete program:",
                error
            );

            // =====================================================
// AUDIT - DELETE PROGRAM
// =====================================================

await writeAuditLog(
    "DELETE",
    "Program Planner",
    `Deleted ${plan.program_type || "program"} program for ${plan.program_date || "-"}`,
    plan.id,
    {
        programType:
            plan.program_type || "",

        programDate:
            plan.program_date || "",

        eventName:
            plan.event_name || "",

        totalItems:
            Array.isArray(plan.items)
                ? plan.items.length
                : 0
    }
);

            alert(
                "❌ Program was not deleted."
            );

            return;
        }


        // =====================================
        // RESET EDITOR IF SAME PROGRAM
        // =====================================

        if (
            String(editingProgramId) ===
            String(programId)
        ) {

            editingProgramId =
                null;

            programItems =
                [];


            const dateInput =
                document.getElementById(
                    "programDate"
                );


            const eventInput =
                document.getElementById(
                    "programEventName"
                );


            if (dateInput) {
                dateInput.value = "";
            }


            if (eventInput) {
                eventInput.value = "";
            }


            const saveButton =
                document.querySelector(
                    '#program-planner button[onclick="saveProgramPlan()"]'
                );


            if (saveButton) {

                saveButton.textContent =
                    "Save Program";

            }


            renderProgramItems();

        }


        // =====================================
        // SUCCESS
        // =====================================

        console.log(
            "✅ Program deleted:",
            programId
        );


        alert(
            "✅ Program deleted successfully."
        );


        // =====================================
        // REFRESH SAVED PROGRAMS
        // =====================================

        await loadProgramPlans();


    } catch (error) {

        console.error(
            "❌ Program Planner delete error:",
            error
        );


        alert(
            "❌ Failed to delete program."
        );

    }

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
const scale = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

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

async function saveSong() {

    if (!requireAdmin()) {
        return;
    }


    const title =
        document
            .getElementById("songTitle")
            .value
            .trim();


    const artist =
        document
            .getElementById("songArtist")
            .value
            .trim();


    const key =
        document
            .getElementById("songKey")
            .value;


    const category =
        document
            .getElementById("songCategory")
            .value;


    const lyrics =
        document
            .getElementById("songLyrics")
            .value
            .trim();


    if (title === "") {

        alert(
            "Please enter a song title."
        );

        return;
    }


    // =====================================
    // EDIT EXISTING SONG
    // =====================================

    if (
        editingSongId !== null
    ) {

        const existingSong =
            songs.find(
                song =>
                    song.id ===
                    editingSongId
            );


        if (!existingSong) {

            alert(
                "❌ Song record not found."
            );

            return;
        }


        const updatedSong = {

            ...existingSong,

            title,

            artist:
                artist ||
                "Unknown Artist",

            key,

            category,

            lyrics

        };


        const updatedInSupabase =
            await updateSongToSupabase(
                updatedSong
            );


        if (!updatedInSupabase) {

            alert(
                "❌ Song was not updated in Supabase."
            );

            return;
        }


        const index =
            songs.findIndex(
                song =>
                    song.id ===
                    editingSongId
            );


        if (index !== -1) {

            songs[index] =
                updatedSong;

        }


        // =====================================
        // AUDIT - EDIT SONG
        // =====================================

        await writeAuditLog(
            "EDIT",
            "Song Library",
            `Updated song: ${updatedSong.title}`,
            updatedSong.id,
            {
                title:
                    updatedSong.title,

                artist:
                    updatedSong.artist,

                key:
                    updatedSong.key,

                category:
                    updatedSong.category
            }
        );


        editingSongId =
            null;

    }


    // =====================================
    // ADD NEW SONG
    // =====================================

    else {

        const song = {

            id:
                Date.now(),

            title,

            artist:
                artist ||
                "Unknown Artist",

            key,

            category,

            lyrics

        };


        const savedToSupabase =
            await saveSongToSupabase(
                song
            );


        if (!savedToSupabase) {

            alert(
                "❌ Song was not saved to Supabase."
            );

            return;
        }


        songs.push(
            song
        );


        // =====================================
        // AUDIT - ADD SONG
        // =====================================

        await writeAuditLog(
            "ADD",
            "Song Library",
            `Added song: ${song.title}`,
            song.id,
            {
                title:
                    song.title,

                artist:
                    song.artist,

                key:
                    song.key,

                category:
                    song.category
            }
        );

    }


    // =====================================
    // REFRESH SONG LIBRARY
    // =====================================

    saveSongsToLocalStorage();

    loadSavedSongs();

    clearSongForm();


    if (songModal) {

        songModal.classList.add(
            "hidden"
        );

    }

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


    const songToDelete =
        songs.find(
            song =>
                String(song.id) ===
                String(id)
        );


    const deletedSongTitle =
        songToDelete
            ? songToDelete.title
            : "Unknown Song";


    if (
        !confirm(
            "Are you sure you want to delete this song?"
        )
    ) {
        return;
    }


    const deletedFromSupabase =
        await deleteSongFromSupabase(
            id
        );


    if (!deletedFromSupabase) {

        alert(
            "❌ Failed to delete song from Supabase."
        );

        return;
    }


    // =====================================
    // AUDIT - DELETE SONG
    // =====================================

    await writeAuditLog(
        "DELETE",
        "Song Library",
        `Deleted song: ${deletedSongTitle}`,
        id,
        {
            title:
                deletedSongTitle,

            artist:
                songToDelete?.artist || "",

            key:
                songToDelete?.key || "",

            category:
                songToDelete?.category || ""
        }
    );


    songs =
        songs.filter(
            song =>
                String(song.id) !==
                String(id)
        );


    saveSongsToLocalStorage();

    loadSavedSongs();

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




// =====================================================
// LOAD MINISTRIES FROM SUPABASE
// =====================================================

async function loadMinistriesFromSupabase() {

    const { data, error } =
        await churchSupabase
            .from("ministries")
            .select("*")
            .order("name", {
                ascending: true
            });


    if (error) {

        console.error(
            "❌ Failed to load ministries:",
            error
        );

        return;
    }


    ministries = data || [];


    console.log(
        "✅ Ministries loaded:",
        ministries
    );


    renderMemberMinistries();
}


// =====================================================
// RENDER MINISTRY CHECKBOXES
// =====================================================

function renderMemberMinistries(
    selectedMinistries = []
) {

    const container =
        document.getElementById(
            "memberMinistry"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    ministries.forEach(
        ministry => {

            const label =
                document.createElement(
                    "label"
                );


            const checked =
                selectedMinistries.includes(
                    ministry.name
                );


            label.innerHTML = `

                <input
                    type="checkbox"
                    value="${ministry.name}"
                    ${checked ? "checked" : ""}
                >

                <span>
                    ${ministry.name}
                </span>

            `;


            container.appendChild(
                label
            );

        }
    );

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

async function saveMember() {

    if (!requireMemberManager()) {
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
            await writeAuditLog(
    "EDIT",
    "Members",
    `Updated member: ${updatedMember.name}`,
    updatedMember.id,
    {
        name: updatedMember.name,
        ministries: updatedMember.ministries,
        role: updatedMember.role
    }
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

            const saveBtn =
    document.getElementById(
        "saveMember"
    );

if (saveBtn) {

    saveBtn.textContent =
        "Save Changes";

}

        if (!savedToSupabase) {
            alert("❌ Member was not saved to Supabase.");
            return;
        }

        members.push(member);

        console.log(
            "✅ New member added successfully:",
            member
        );

        await writeAuditLog(
    "ADD",
    "Members",
    `Added new member: ${member.name}`,
    member.id,
    {
        name: member.name,
        ministries: member.ministries,
        role: member.role
    }
);
    }

    // =====================================
    // UPDATE EXISTING LOCAL UI/STORAGE
    // =====================================

    saveMembersToLocalStorage();
    loadSavedMembers();
    loadDashboardBirthdays();
    renderAttendanceList();
    clearMemberForm();
    refreshDashboardStatus();
    filterMembers();

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

// =====================================
// MEMBER AGE AUTO COMPUTE
// =====================================

function calculateAge(birthday) {

    if (!birthday) {
        return null;
    }

    const birthDate =
        new Date(
            birthday + "T00:00:00"
        );

    if (
        isNaN(
            birthDate.getTime()
        )
    ) {
        return null;
    }

    const today =
        new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const monthDifference =
        today.getMonth() -
        birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() <
            birthDate.getDate()
        )
    ) {
        age--;
    }

    return age;
}

// =====================================
// MEMBER AGE GROUP
// =====================================

function getAgeGroup(age) {

    if (
        age === null ||
        age === undefined ||
        age === ""
    ) {
        return "Unknown";
    }

    if (age <= 12) {
        return "Children";
    }

    if (age <= 21) {
        return "Youth";
    }

    if (age <= 34) {
        return "Young Pro";
    }

    if (age <= 59) {
        return "Adult";
    }

    return "Senior";
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
        document.getElementById(
            "memberMinistryFilter"
        );

    if (!filter) {
        return;
    }


    // Keep current selected value
    const currentValue =
        filter.value;


    filter.innerHTML = "";


    // ALL MINISTRIES
    const allOption =
        document.createElement(
            "option"
        );

    allOption.value = "";
    allOption.textContent =
        "All Ministries";

    filter.appendChild(
        allOption
    );


    // =====================================
    // SOURCE: SUPABASE MINISTRIES MASTER LIST
    // =====================================

    const sortedMinistries =
        (Array.isArray(ministries)
            ? [...ministries]
            : []
        )
        .sort(
            (a, b) =>
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


    sortedMinistries.forEach(
        ministry => {

            if (!ministry.name) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                ministry.name;


            option.textContent =
                ministry.name;


            filter.appendChild(
                option
            );

        }
    );


    // Restore selection if it still exists
    const valueStillExists =
        Array.from(
            filter.options
        ).some(
            option =>
                option.value ===
                currentValue
        );


    if (valueStillExists) {
        filter.value =
            currentValue;
    }

}

function filterMembers() {

    const searchInput =
        document.getElementById(
            "memberSearch"
        );

    const ministryFilter =
        document.getElementById(
            "memberMinistryFilter"
        );

    const ageGroupFilter =
        document.getElementById(
            "memberAgeGroupFilter"
        );

    const membersGrid =
        document.getElementById(
            "membersGrid"
        );

    if (!membersGrid) return;

    const searchQuery =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const selectedMinistry =
        ministryFilter
            ? ministryFilter.value
            : "";

    const selectedAgeGroup =
        ageGroupFilter
            ? ageGroupFilter.value
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

            // -------------------------------
// AGE GROUP FILTER
// -------------------------------

const age =
    calculateAge(
        member.birthday
    );

const ageGroup =
    getAgeGroup(age);

const matchesAgeGroup =
    selectedAgeGroup === "" ||
    ageGroup === selectedAgeGroup;

        return (
    matchesSearch &&
    matchesMinistry &&
    matchesAgeGroup
);
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

const memberAgeGroupFilter =
    document.getElementById(
        "memberAgeGroupFilter"
    );

if (memberAgeGroupFilter) {

    memberAgeGroupFilter.addEventListener(
        "change",
        () => {
            filterMembers();
        }
    );

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

    const age =
    calculateAge(
        member.birthday
    );

    card.innerHTML = `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0;">${member.name}</h3>
                <span class="status-badge" style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-size:12px;">${member.status}</span>
            </div>

            <p class="artist">📞 ${member.contact}</p>

            <div style="margin-top: 10px; font-size: 12px; color:#64748b;">
    <span>🏛️ ${ministryText}</span> |
    <span>💼 ${member.role}</span> |
    <span>
        🎂 ${
            age !== null
                ? `${age} years old`
                : "Age N/A"
        }
    </span>
</div>

        <div style="display:flex; justify-content:space-between; margin-top:15px;">
            <button
    type="button"
    class="secondary-btn"
    data-member-manage="true"
    style="
        padding:4px 10px;
        font-size:12px;
    "
    onclick="editMember(${member.id})"
>
    ✏️ Edit
</button>


<button
    type="button"
    data-member-manage="true"
    onclick="deleteMember(${member.id})"
    style="
        background:none;
        border:none;
        color:#ef4444;
        cursor:pointer;
        font-size:16px;
        font-weight:bold;
    "
>
    &times;
</button>
        </div>
    `;

    membersGrid.appendChild(card);

    if (
    typeof applyRoleBasedUI === "function"
) {
    applyRoleBasedUI();
}

}

function editMember(id) {

if (!requireMemberManager()) {
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

const saveBtn =
    document.getElementById(
        "saveMember"
    );

if (saveBtn) {

    saveBtn.textContent =
        "Save Changes";

}

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

// =====================================================
// ADD NEW MINISTRY
// =====================================================

async function addCustomMinistry() {

    if (!requireAdmin()) {
        return;
    }


    const ministryName =
        prompt(
            "Enter new ministry name:"
        );


    if (ministryName === null) {
        return;
    }


    const cleanName =
        ministryName.trim();


    if (!cleanName) {

        alert(
            "Please enter a ministry name."
        );

        return;
    }


    // =====================================
    // CHECK EXISTING MINISTRY
    // =====================================

    const alreadyExists =
        ministries.some(
            ministry =>
                String(ministry.name)
                    .trim()
                    .toLowerCase() ===
                cleanName.toLowerCase()
        );


    if (alreadyExists) {

        alert(
            "This ministry already exists."
        );

        return;
    }


    // =====================================
    // SAVE TO SUPABASE
    // =====================================

    const {
        data,
        error
    } =
        await churchSupabase

            .from("ministries")

            .insert({

                name:
                    cleanName

            })

            .select()

            .single();


    if (error) {

        console.error(
            "❌ Failed to add ministry:",
            error
        );


        alert(
            "❌ Failed to save ministry."
        );

        return;
    }


    // =====================================
    // UPDATE LOCAL ARRAY
    // =====================================

    ministries.push(
        data
    );


    ministries.sort(
        (a, b) =>
            String(a.name)
                .localeCompare(
                    String(b.name)
                )
    );


    // =====================================
    // KEEP CURRENT CHECKBOX SELECTION
    // =====================================

    const currentlySelected =
        getSelectedMemberMinistries();


    currentlySelected.push(
        data.name
    );


    // =====================================
    // RENDER AGAIN
    // =====================================

    renderMemberMinistries(
        currentlySelected
    );

    populateMemberMinistryFilter();
    populateMinistryDashboardSelect();


    console.log(
        "✅ Ministry saved:",
        data
    );


    alert(
        "✅ Ministry added successfully."
    );

}

// =====================================================
// OPEN MANAGE MINISTRIES
// =====================================================

function openManageMinistries() {

    if (!requireAdmin()) {
        return;
    }

    const modal =
        document.getElementById(
            "manageMinistriesModal"
        );

    if (!modal) {
        return;
    }

    renderManageMinistries();

    modal.classList.remove(
        "hidden"
    );
}


// =====================================================
// CLOSE MANAGE MINISTRIES
// =====================================================

function closeManageMinistries() {

    const modal =
        document.getElementById(
            "manageMinistriesModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }
}


// =====================================================
// RENDER MANAGE MINISTRIES
// =====================================================

function renderManageMinistries() {

    const container =
        document.getElementById(
            "manageMinistriesList"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(ministries) ||
        ministries.length === 0
    ) {

        container.innerHTML = `
            <div
                style="
                    padding:15px;
                    color:#94a3b8;
                    text-align:center;
                "
            >
                No ministries found.
            </div>
        `;

        return;
    }


    ministries.forEach(
        ministry => {

            const row =
                document.createElement(
                    "div"
                );


            row.style.cssText = `
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
                padding:10px 12px;
                border:1px solid #e2e8f0;
                border-radius:8px;
            `;


            row.innerHTML = `

                <span
                    style="
                        font-size:13px;
                        font-weight:600;
                    "
                >
                    ${ministry.name}
                </span>


                <div
                    style="
                        display:flex;
                        gap:6px;
                    "
                >

                    <button
                        type="button"
                        class="secondary-btn"
                        style="
                            padding:4px 8px;
                            font-size:10px;
                        "
                        onclick="editMinistry(${ministry.id})"
                    >
                        ✏ Edit
                    </button>


                    <button
                        type="button"
                        class="secondary-btn"
                        style="
                            padding:4px 8px;
                            font-size:10px;
                            color:#dc2626;
                        "
                        onclick="deleteMinistry(${ministry.id})"
                    >
                        ✖ Delete
                    </button>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}

// =====================================================
// EDIT MINISTRY
// =====================================================

async function editMinistry(id) {

    if (!requireAdmin()) {
        return;
    }


    const ministry =
        ministries.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!ministry) {

        alert(
            "Ministry was not found."
        );

        return;
    }


    const oldName =
        ministry.name;


    const newNameInput =
        prompt(
            "Edit ministry name:",
            oldName
        );


    if (newNameInput === null) {
        return;
    }


    const newName =
        newNameInput.trim();


    if (!newName) {

        alert(
            "Ministry name cannot be empty."
        );

        return;
    }


    if (
        newName.toLowerCase() ===
        oldName.toLowerCase()
    ) {
        return;
    }


    // =====================================
    // DUPLICATE CHECK
    // =====================================

    const duplicate =
        ministries.some(
            item =>
                String(item.id) !==
                    String(id) &&

                String(item.name)
                    .trim()
                    .toLowerCase() ===
                newName.toLowerCase()
        );


    if (duplicate) {

        alert(
            "This ministry already exists."
        );

        return;
    }


    try {

        // =====================================
        // 1. UPDATE MINISTRIES TABLE
        // =====================================

        const {
            data: updatedMinistry,
            error: ministryError
        } =
            await churchSupabase
                .from("ministries")
                .update({
                    name:
                        newName
                })
                .eq(
                    "id",
                    id
                )
                .select()
                .single();


        if (ministryError) {

            console.error(
                "❌ Failed to update ministry:",
                ministryError
            );

            alert(
                "❌ Failed to update ministry."
            );

            return;
        }


        // =====================================
        // 2. FIND AFFECTED MEMBERS
        // =====================================

        const affectedMembers =
            members.filter(member => {

                const memberMinistries =
                    Array.isArray(
                        member.ministries
                    )
                        ? member.ministries
                        : (
                            member.ministry
                                ? [member.ministry]
                                : []
                        );


                return memberMinistries
                    .some(
                        name =>
                            String(name)
                                .trim()
                                .toLowerCase() ===
                            oldName.toLowerCase()
                    );

            });


        // =====================================
        // 3. UPDATE AFFECTED MEMBERS
        // =====================================

        for (
            const member
            of affectedMembers
        ) {

            let updatedMinistries =
                Array.isArray(
                    member.ministries
                )
                    ? [...member.ministries]
                    : (
                        member.ministry
                            ? [member.ministry]
                            : []
                    );


            updatedMinistries =
                updatedMinistries.map(
                    name =>
                        String(name)
                            .trim()
                            .toLowerCase() ===
                        oldName.toLowerCase()

                            ? newName

                            : name
                );


            const updatedMember = {

                ...member,

                ministry:
                    String(
                        member.ministry || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    oldName.toLowerCase()

                        ? newName

                        : (
                            member.ministry ||
                            updatedMinistries[0] ||
                            ""
                        ),

                ministries:
                    updatedMinistries

            };


            const updated =
                await updateMemberToSupabase(
                    updatedMember
                );


            if (!updated) {

                alert(
                    `❌ Ministry was renamed, but failed to update member: ${member.name}`
                );

                await loadMinistriesFromSupabase();
                await loadMembersFromSupabase();
                populateMemberMinistryFilter();
                populateMinistryDashboardSelect();

                return;
            }

        }


        // =====================================
        // 4. RELOAD EVERYTHING
        // =====================================

        await loadMinistriesFromSupabase();

        await loadMembersFromSupabase();


        renderManageMinistries();


        console.log(
            "✅ Ministry renamed:",
            oldName,
            "→",
            newName
        );


        alert(
            `✅ Ministry renamed successfully.\n\n${oldName} → ${newName}`
        );


    } catch (error) {

        console.error(
            "❌ Edit ministry error:",
            error
        );


        alert(
            "❌ Failed to edit ministry."
        );

    }

}

// =====================================================
// DELETE MINISTRY
// =====================================================

async function deleteMinistry(id) {

    if (!requireAdmin()) {
        return;
    }


    const ministry =
        ministries.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!ministry) {

        alert(
            "Ministry was not found."
        );

        return;
    }


    const ministryName =
        ministry.name;


    // =====================================
    // CHECK IF MINISTRY IS IN USE
    // =====================================

    const affectedMembers =
        members.filter(member => {

            const memberMinistries =
                Array.isArray(
                    member.ministries
                )
                    ? member.ministries
                    : (
                        member.ministry
                            ? [member.ministry]
                            : []
                    );


            return memberMinistries.some(
                name =>
                    String(name)
                        .trim()
                        .toLowerCase() ===
                    String(ministryName)
                        .trim()
                        .toLowerCase()
            );

        });


    // =====================================
    // BLOCK DELETE IF USED BY MEMBERS
    // =====================================

    if (
        affectedMembers.length > 0
    ) {

        const names =
            affectedMembers
                .slice(0, 5)
                .map(
                    member =>
                        member.name
                )
                .join("\n• ");


        let message =

            `"${ministryName}" cannot be deleted yet.\n\n` +

            `${affectedMembers.length} member(s) are still assigned to this ministry.\n\n` +

            "Examples:\n• " +
            names;


        if (
            affectedMembers.length > 5
        ) {

            message +=
                `\n• +${affectedMembers.length - 5} more`;

        }


        message +=
            "\n\nPlease edit those members first and remove this ministry from their Ministry Group.";


        alert(
            message
        );


        return;
    }


    // =====================================
    // CONFIRM DELETE
    // =====================================

    const confirmed =
        confirm(
            `Delete ministry "${ministryName}"?\n\n` +
            "This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        // =====================================
        // DELETE FROM SUPABASE
        // =====================================

        const {
            error
        } =
            await churchSupabase

                .from(
                    "ministries"
                )

                .delete()

                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "❌ Failed to delete ministry:",
                error
            );


            alert(
                "❌ Failed to delete ministry."
            );

            return;
        }


        // =====================================
        // REMOVE FROM LOCAL ARRAY
        // =====================================

        ministries =
            ministries.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );


        // Keep current member checkbox selections
        const selected =
            getSelectedMemberMinistries();


        renderMemberMinistries(
            selected
        );

renderManageMinistries();

populateMemberMinistryFilter();

populateMinistryDashboardSelect();

alert(
    "✅ Ministry deleted successfully."
);

} catch (error) {

    console.error(
        "❌ Delete ministry error:",
        error
    );

    alert(
        "❌ Failed to delete ministry."
    );

}

}

async function deleteMember(id) {

    if (!requireMemberManager()) {
        return;
    }


    const memberToDelete =
        members.find(
            member =>
                String(member.id) ===
                String(id)
        );


    const deletedMemberName =
        memberToDelete
            ? memberToDelete.name
            : "Unknown Member";


    if (
        !confirm(
            "Are you sure you want to delete this member?"
        )
    ) {
        return;
    }


    const deletedFromSupabase =
        await deleteMemberFromSupabase(
            id
        );


    if (!deletedFromSupabase) {

        alert(
            "❌ Member was not deleted from Supabase."
        );

        return;
    }


    // =====================================
    // AUDIT - DELETE MEMBER
    // =====================================

    await writeAuditLog(
        "DELETE",
        "Members",
        `Deleted member: ${deletedMemberName}`,
        id,
        {
            name: deletedMemberName
        }
    );


    members =
        members.filter(
            m =>
                String(m.id) !==
                String(id)
        );


    saveMembersToLocalStorage();

    loadSavedMembers();

    loadDashboardBirthdays();

    refreshDashboardStatus();


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


// =====================================================
// ATTENDANCE - OPEN ADD MEMBER MODAL
// =====================================================

function openAttendanceAddMember() {

    if (!requireMemberManager()) {
        return;
    }


    clearMemberForm();

    const saveBtn =
    document.getElementById(
        "saveMember"
    );

if (saveBtn) {

    saveBtn.textContent =
        "Add Member";

}

    const modal =
        document.getElementById(
            "memberModal"
        );

    const modalTitle =
        document.getElementById(
            "memberModalTitle"
        );

    const editId =
        document.getElementById(
            "editMemberId"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "Add New Member";

    }



    if (editId) {

        editId.value = "";

    }


    // Reload current ministries
    if (
        typeof renderMemberMinistries ===
        "function"
    ) {

        renderMemberMinistries([]);

    }


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

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
    members
        .filter(member => {

            if (!member.birthday) {
                return false;
            }

            const birthdayDate =
                new Date(
                    member.birthday + "T00:00:00"
                );

            return (
                birthdayDate.getMonth() ===
                currentMonth
            );

        })
        .sort((a, b) => {

    const dayA =
        Number(
            a.birthday.split("-")[2]
        );

    const dayB =
        Number(
            b.birthday.split("-")[2]
        );

    // =====================================
    // FIRST: SORT BY BIRTHDAY DAY
    // =====================================

    if (dayA !== dayB) {
        return dayA - dayB;
    }

    // =====================================
    // SAME BIRTHDAY: SORT BY NAME
    // =====================================

    return String(a.name || "")
        .localeCompare(
            String(b.name || ""),
            undefined,
            {
                sensitivity: "base"
            }
        );

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

    if (!canManageAttendance()) {

        alert(
            "You do not have permission to manage attendance."
        );

        return;
    }

    currentCheckIns[memberId] =
        !currentCheckIns[memberId];

    renderAttendanceList();
}

function markAllAttendance(status) {

    if (!canManageAttendance()) {

    alert(
        "You do not have permission to manage attendance."
    );

    return;
}

    members.forEach(member => {
        currentCheckIns[member.id] = status;
    });

    renderAttendanceList();
}


async function saveAttendance() {

    if (!canManageAttendance()) {

    alert(
        "You do not have permission to save attendance."
    );

    return;
}

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
        await updateAttendanceToSupabase(
            recordData
        );


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


    // =====================================
    // AUDIT - UPDATE ATTENDANCE
    // =====================================

    await writeAuditLog(
        "EDIT",
        "Attendance",
        `Updated ${
            serviceType === "midweek"
                ? "Midweek"
                : "Sunday"
        } attendance: ${eventName} (${date})`,
        attendanceRecords[index].id,
        {
            date: date,
            eventName: eventName,
            serviceType: serviceType,
            presentCount:
                recordData.presentCount,
            totalMembers:
                recordData.totalMembers
        }
    );


} else {

    const savedToSupabase =
        await saveAttendanceToSupabase(
            recordData
        );


    if (!savedToSupabase) {

        alert(
            "❌ Attendance was not saved to Supabase."
        );

        return;
    }


    attendanceRecords.push(
        recordData
    );


    // =====================================
    // AUDIT - NEW ATTENDANCE
    // =====================================

    await writeAuditLog(
        "ADD",
        "Attendance",
        `Saved ${
            serviceType === "midweek"
                ? "Midweek"
                : "Sunday"
        } attendance: ${eventName} (${date})`,
        date,
        {
            date: date,
            eventName: eventName,
            serviceType: serviceType,
            presentCount:
                recordData.presentCount,
            totalMembers:
                recordData.totalMembers
        }
    );

}

    localStorage.setItem(
    "churchhq_attendance",
    JSON.stringify(attendanceRecords)
);


// =====================================
// AUTO REFRESH ATTENDANCE RECORDS
// =====================================

await loadAttendanceFromSupabase();


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
    renderAttendanceHistory();

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
            refreshDashboardStatus();

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



const visibleMembers =
    filtered.slice(0, 5);


visibleMembers.forEach(member => {

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

// =========================================
// ATTENDANCE MEMBER SUMMARY
// =========================================

function renderAttendanceSummary(searchText = "") {

    const body =
        document.getElementById(
            "attendanceSummaryBody"
        );

    if (!body) {
        return;
    }


    const summaries =
        calculateMemberAttendanceSummary();


    const search =
        String(searchText || "")
            .trim()
            .toLowerCase();


    body.innerHTML = "";


    // =====================================
    // FILTER MEMBERS
    // WALANG SEARCH = SHOW ALL
    // =====================================

    let filtered;

    if (search) {

        filtered =
            summaries.filter(member => {

                const memberName =
                    String(
                        member.name || ""
                    )
                    .toLowerCase();

                return memberName.includes(
                    search
                );

            });

    } else {

        filtered = summaries;

    }


    // =====================================
    // WALANG RESULT
    // =====================================

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
                    No member found.
                </td>
            </tr>
        `;

        return;
    }


   // =====================================
// SHOW ONLY 5 MEMBERS
// =====================================

const visibleMembers =
    filtered.slice(0, 5);


visibleMembers.forEach(member => {

        const tr =
            document.createElement(
                "tr"
            );


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

// =========================================
// ATTENDANCE SUMMARY SEARCH
// =========================================

const attendanceSummarySearch =
    document.getElementById(
        "attendanceSummarySearch"
    );


if (attendanceSummarySearch) {

    attendanceSummarySearch
        .addEventListener(
            "input",
            function () {

                renderAttendanceSummary(
                    this.value
                );

            }
        );

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
// MISSING BIRTHDAY
// =====================================

const birthdayValue =
    String(
        originalMember.birthday || ""
    ).trim();


if (!birthdayValue) {

    alerts.push({

        memberId:
            member.id,

        memberName:
            member.name,

        type:
            "missing-birthday",

        level:
            "info",

        message:
            "No birthday recorded."

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

// =========================================
// PLANNER STATUS ALERTS
// Due Soon + Due Today + Overdue
// =========================================

function calculatePlannerStatusAlerts() {

    const alerts = [];

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    tasks.forEach(task => {

        const status =
            String(
                task.status || ""
            )
                .trim()
                .toLowerCase();


        // Ignore tasks without due date
        // and completed tasks
        if (
            !task.dueDate ||
            status === "completed"
        ) {
            return;
        }


        const dueDate =
            new Date(
                `${task.dueDate}T00:00:00`
            );


        if (
            isNaN(
                dueDate.getTime()
            )
        ) {
            return;
        }


        // =====================================
        // DAYS DIFFERENCE
        // Positive = future
        // 0 = today
        // Negative = overdue
        // =====================================

        const daysDifference =
            Math.round(
                (
                    dueDate.getTime() -
                    today.getTime()
                ) /
                86400000
            );


        const assignedText =
            task.assignedTo
                ? ` Assigned to: ${task.assignedTo}.`
                : "";


        // =====================================
        // OVERDUE
        // =====================================

        if (
            daysDifference < 0
        ) {

            const overdueDays =
                Math.abs(
                    daysDifference
                );


            alerts.push({

                module:
                    "Planner",

                name:
                    task.title ||
                    "Untitled Task",

                type:
                    "overdue-task",

                level:
                    "warning",

                message:
                    `Task is overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}.${assignedText}`

            });


            return;
        }


        // =====================================
        // DUE TODAY
        // =====================================

        if (
            daysDifference === 0
        ) {

            alerts.push({

                module:
                    "Planner",

                name:
                    task.title ||
                    "Untitled Task",

                type:
                    "task-due-today",

                level:
                    "warning",

                message:
                    `Task is due today.${assignedText}`

            });


            return;
        }


        // =====================================
        // DUE SOON
        // Show starting 3 days before due date
        // =====================================

        if (
            daysDifference <= 3
        ) {

            alerts.push({

                module:
                    "Planner",

                name:
                    task.title ||
                    "Untitled Task",

                type:
                    "task-due-soon",

                level:
                    "info",

                message:
                    `Task is due in ${daysDifference} day${daysDifference === 1 ? "" : "s"}.${assignedText}`

            });

        }

    });


    return alerts;

}

// =========================================
// SERVICE STATUS ALERTS
// =========================================

function calculateServiceStatusAlerts() {

    const alerts = [];


    function checkServiceRecords(
        records,
        serviceLabel
    ) {

        records.forEach(record => {

            const date =
                record.date ||
                "Unknown Date";

// =====================================
// MISSING WORSHIP LEADER
// SUNDAY ONLY
// =====================================

if (
    serviceLabel === "Sunday Service" &&
    !String(
        record.worshipLeader || ""
    ).trim()
) {

    alerts.push({

        module:
            serviceLabel,

        name:
            date,

        type:
            "missing-worship-leader",

        level:
            "warning",

        message:
            "No Worship Leader assigned."

    });

}


            // =====================================
            // MISSING PREACHER
            // =====================================

            if (
                !String(
                    record.preacher || ""
                ).trim()
            ) {

                alerts.push({

                    module:
                        serviceLabel,

                    name:
                        date,

                    type:
                        "missing-preacher",

                    level:
                        "warning",

                    message:
                        "No preacher assigned."

                });

            }


            // =====================================
            // MISSING MESSAGE TITLE
            // =====================================

            if (
                !String(
                    record.messageTitle || ""
                ).trim()
            ) {

                alerts.push({

                    module:
                        serviceLabel,

                    name:
                        date,

                    type:
                        "missing-message-title",

                    level:
                        "info",

                    message:
                        "Message title is missing."

                });

            }

        });

    }


    // Sunday
    checkServiceRecords(
        sundayServices,
        "Sunday Service"
    );


    // Midweek
    checkServiceRecords(
        midweekServices,
        "Midweek Service"
    );


    return alerts;

}

// =========================================
// FILES STATUS ALERTS
// =========================================

function calculateFileStatusAlerts() {

    const alerts = [];


    fileFolders.forEach(folder => {

        const folderName =
            String(
                folder.name || "Unnamed Folder"
            ).trim();


        const driveLink =
            String(
                folder.drive_link || ""
            ).trim();


        const description =
            String(
                folder.description || ""
            ).trim();


        // =====================================
        // MISSING GOOGLE DRIVE LINK
        // =====================================

        if (!driveLink) {

            alerts.push({

                module: "Files",

                name: folderName,

                type:
                    "missing-drive-link",

                level:
                    "warning",

                message:
                    "Google Drive link is missing."

            });

        }


        // =====================================
        // MISSING DESCRIPTION
        // =====================================

        if (!description) {

            alerts.push({

                module: "Files",

                name: folderName,

                type:
                    "missing-description",

                level:
                    "info",

                message:
                    "Folder description is missing."

            });

        }

    });


    return alerts;

}


// =========================================
// ANNUAL ACTIVITY STATUS ALERTS
// =========================================

function calculateAnnualActivityStatusAlerts() {

    const alerts = [];

    if (!Array.isArray(annualActivities)) {
        return alerts;
    }


    const today = new Date();

    today.setHours(
        0, 0, 0, 0
    );


    annualActivities.forEach(activity => {

        if (!activity.date) {
            return;
        }


        const activityDate =
            new Date(
                activity.date +
                "T00:00:00"
            );


        activityDate.setHours(
            0, 0, 0, 0
        );


        const difference =
            activityDate.getTime() -
            today.getTime();


        const daysUntil =
            Math.round(
                difference /
                (1000 * 60 * 60 * 24)
            );


        // Already finished
        if (daysUntil < 0) {
            return;
        }


        // Only alert within 30 days
        if (daysUntil > 30) {
            return;
        }


        let message = "";
        let level = "info";


        // TODAY
        if (daysUntil === 0) {

            message =
                "This activity is happening today.";

            level =
                "warning";

        }

        // TOMORROW
        else if (daysUntil === 1) {

            message =
                "This activity is happening tomorrow.";

            level =
                "warning";

        }

        // 2 - 7 DAYS
        else if (daysUntil <= 7) {

            message =
                `This activity is in ${daysUntil} days.`;

            level =
                "warning";

        }

        // 8 - 30 DAYS
        else {

            message =
                `Upcoming in ${daysUntil} days.`;

            level =
                "info";

        }


        alerts.push({

            module:
                "Activities",

            name:
                activity.title ||
                "Church Activity",

            type:
                "annual-activity",

            level,

            message,

            date:
                activity.date

        });

    });


    // Closest activity first
    alerts.sort(
        (a, b) =>
            String(a.date)
                .localeCompare(
                    String(b.date)
                )
    );


    return alerts;
}

// =========================================
// SYSTEM STATUS ALERTS ENGINE
// =========================================
function calculateSystemStatusAlerts() {

    const systemAlerts = [];


    // =====================================
    // MEMBER ALERTS
    // =====================================

    const memberAlerts =
        calculateMemberStatusAlerts();


    memberAlerts.forEach(alert => {

        systemAlerts.push({

            module: "Members",

            name:
                alert.memberName,

            type:
                alert.type,

            level:
                alert.level,

            message:
                alert.message

        });

    });


    // =====================================
    // PLANNER ALERTS
    // =====================================

    const plannerAlerts =
        calculatePlannerStatusAlerts();


    systemAlerts.push(
        ...plannerAlerts
    );


    // =====================================
    // SERVICE ALERTS
    // =====================================

    const serviceAlerts =
        calculateServiceStatusAlerts();


    systemAlerts.push(
        ...serviceAlerts
    );

    // =====================================
// FILE ALERTS
// =====================================

const fileAlerts =
    calculateFileStatusAlerts();


systemAlerts.push(
    ...fileAlerts
);

// =====================================
// ANNUAL ACTIVITY ALERTS
// =====================================

const annualActivityAlerts =
    calculateAnnualActivityStatusAlerts();


systemAlerts.push(
    ...annualActivityAlerts
);

    return systemAlerts;

}

// =========================================
// SYSTEM STATUS ALERTS UI
// ORGANIZED + SCROLLABLE
// =========================================

function renderSystemStatusAlerts() {

    const container =
        document.getElementById(
            "systemStatusAlertsList"
        );


    const countEl =
        document.getElementById(
            "systemAlertCount"
        );


    if (!container) {
        return;
    }


    const alerts =
        calculateSystemStatusAlerts();


    // =====================================
    // TOTAL ALERT COUNT
    // =====================================

    if (countEl) {

        countEl.textContent =
            alerts.length;

    }


    container.innerHTML = "";


    // =====================================
    // NO ALERTS
    // =====================================

    if (alerts.length === 0) {

        container.innerHTML = `

            <div class="member-alert-all-good">

                <div class="member-alert-good-icon">
                    ✓
                </div>


                <div class="member-alert-good-content">

                    <strong>
                        ChurchHQ System Looks Good
                    </strong>

                    <span>
                        No system alerts require attention at this time.
                    </span>

                </div>

            </div>

        `;


        return;

    }


    // =====================================
    // ALERT GROUP DEFINITIONS
    // =====================================

    const groups = [

        {
            key:
                "member-contact",

            title:
                "Members — No Contact",

            icon:
                "📞",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Members" &&
                        alert.type === "missing-contact"
                )
        },


        {
            key:
                "member-birthday",

            title:
                "Members — No Birthday",

            icon:
                "🎂",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Members" &&
                        alert.type === "missing-birthday"
                )
        },


        {
            key:
                "member-attendance",

            title:
                "Members — No Attendance",

            icon:
                "📋",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Members" &&
                        alert.type === "no-attendance"
                )
        },


        {
            key:
                "member-low-attendance",

            title:
                "Members — Low Attendance",

            icon:
                "📉",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Members" &&
                        alert.type === "low-attendance"
                )
        },


        {
            key:
                "member-inactive",

            title:
                "Members — Inactive",

            icon:
                "👤",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Members" &&
                        alert.type === "inactive"
                )
        },


        {
            key:
                "member-no-ministry",

            title:
                "Members — No Ministry",

            icon:
                "🏛️",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Members" &&
                        alert.type === "no-ministry"
                )
        },


        {
            key:
                "member-upcoming-birthday",

            title:
                "Members — Upcoming Birthday",

            icon:
                "🎉",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Members" &&
                        alert.type === "birthday"
                )
        },


        {
            key:
                "planner",

            title:
                "Planner",

            icon:
                "📌",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Planner"
                )
        },


        {
            key:
                "services",

            title:
                "Services",

            icon:
                "⛪",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Services" ||
                        alert.module === "Sunday Service" ||
                        alert.module === "Midweek Service"
                )
        },


        {
            key:
                "files",

            title:
                "Files",

            icon:
                "📁",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Files"
                )
        },


        {
            key:
                "activities",

            title:
                "Activities",

            icon:
                "📅",

            alerts:
                alerts.filter(
                    alert =>
                        alert.module === "Activities"
                )
        }

    ];


    // =====================================
    // FIND ALERTS NOT COVERED ABOVE
    // =====================================

    const groupedAlerts =
        new Set();


    groups.forEach(group => {

        group.alerts.forEach(alert => {

            groupedAlerts.add(
                alert
            );

        });

    });


    const otherAlerts =
        alerts.filter(
            alert =>
                !groupedAlerts.has(
                    alert
                )
        );


    if (otherAlerts.length > 0) {

        groups.push({

            key:
                "other",

            title:
                "Other System Alerts",

            icon:
                "ℹ️",

            alerts:
                otherAlerts

        });

    }


    // =====================================
    // RENDER GROUPS
    // =====================================

    groups.forEach(group => {

        if (
            group.alerts.length === 0
        ) {

            return;

        }


        // =====================================
        // SORT ITEMS ALPHABETICALLY
        // =====================================

        group.alerts.sort(
            (a, b) =>
                String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    ),
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                )
        );


        // =====================================
        // GROUP WRAPPER
        // =====================================

        const groupElement =
            document.createElement(
                "div"
            );


        groupElement.className =
            "system-alert-group";


        // =====================================
        // GROUP HEADER
        // =====================================

        const groupHeader =
            document.createElement(
                "div"
            );


        groupHeader.className =
            "system-alert-group-header";


        groupHeader.innerHTML = `

            <div class="system-alert-group-title">

                <span class="system-alert-group-icon">
                    ${group.icon}
                </span>

                <strong>
                    ${group.title}
                </strong>

            </div>


            <span class="system-alert-group-count">
                ${group.alerts.length}
            </span>

        `;


        groupElement.appendChild(
            groupHeader
        );


        // =====================================
        // ALERT ITEMS
        // =====================================

        group.alerts.forEach(alert => {

            let icon =
                "ℹ️";


            let className =
                "member-alert-info";


            if (
                alert.level ===
                "warning"
            ) {

                icon =
                    "⚠️";

                className =
                    "member-alert-warning";

            }


            if (
                alert.level ===
                "birthday"
            ) {

                icon =
                    "🎂";

                className =
                    "member-alert-birthday";

            }


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                `member-alert-item ${className}`;


            item.innerHTML = `

                <div class="member-alert-icon">
                    ${icon}
                </div>


                <div class="member-alert-content">

                    <strong>
                        ${alert.name || "System Alert"}
                    </strong>

                    <span>
                        ${alert.message || ""}
                    </span>

                </div>

            `;


            groupElement.appendChild(
                item
            );

        });


        container.appendChild(
            groupElement
        );

    });

}

/* =========================================
   MINISTRY DASHBOARD ENGINE
   STEP 6A
========================================= */

function getAvailableMinistries() {

    if (
        !Array.isArray(ministries)
    ) {
        return [];
    }


    return ministries

        .map(
            ministry =>
                String(
                    ministry.name || ""
                ).trim()
        )

        .filter(Boolean)

        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    {
                        sensitivity:
                            "base"
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

    // =====================================
// AUTO REFRESH ALL ATTENDANCE UI
// =====================================

renderAttendanceHistory();

loadAttendanceForDate();

renderAttendanceSummary(
    document.getElementById(
        "attendanceSummarySearch"
    )?.value || ""
);

renderTopAttendance();

refreshDashboardStatus();


    alert(
        `✅ ${actualServiceType === "midweek" ? "Midweek" : "Sunday"} attendance from ${date} is successfully deleted.`
    );
}

async function deleteAttendance(
    date,
    serviceType
) {

    if (!requireAdmin()) {
        return;
    }


    if (
        !confirm(
            `Are you sure you want to delete the attendance record for ${date}?`
        )
    ) {
        return;
    }


    const actualServiceType =
        serviceType || "sunday";


    // =====================================
    // GET RECORD BEFORE DELETE
    // =====================================

    const attendanceToDelete =
        attendanceRecords.find(
            record =>
                record.date === date &&
                (
                    record.serviceType ||
                    "sunday"
                ) === actualServiceType
        );


    const deletedEventName =
        attendanceToDelete
            ? attendanceToDelete.eventName
            : "Attendance";


    // =====================================
    // DELETE FROM SUPABASE
    // =====================================

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

// =====================================
// ATTENDANCE - SUPABASE DELETE
// =====================================

async function deleteAttendanceFromSupabase(
    date,
    serviceType
) {

    try {

        const actualServiceType =
            serviceType || "sunday";


        const { data, error } =
            await churchSupabase
                .from("attendance_records")
                .delete()
                .eq(
                    "date",
                    date
                )
                .eq(
                    "service_type",
                    actualServiceType
                )
                .select();


        if (error) {

            console.error(
                "❌ Failed to delete attendance from Supabase:",
                error
            );

            return false;
        }


        if (
            !data ||
            data.length === 0
        ) {

            console.error(
                "❌ No attendance record was deleted.",
                {
                    date,
                    serviceType:
                        actualServiceType
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
    // AUDIT - DELETE ATTENDANCE
    // =====================================

    await writeAuditLog(
        "DELETE",
        "Attendance",
        `Deleted ${
            actualServiceType === "midweek"
                ? "Midweek"
                : "Sunday"
        } attendance: ${deletedEventName} (${date})`,
        attendanceToDelete
            ? attendanceToDelete.id
            : date,
        {
            date: date,
            eventName:
                deletedEventName,
            serviceType:
                actualServiceType
        }
    );


    // =====================================
    // REMOVE LOCAL RECORD
    // =====================================

    attendanceRecords =
        attendanceRecords.filter(
            record =>
                !(
                    record.date === date &&
                    (
                        record.serviceType ||
                        "sunday"
                    ) === actualServiceType
                )
        );


    localStorage.setItem(
        "churchhq_attendance",
        JSON.stringify(
            attendanceRecords
        )
    );


    // =====================================
    // REFRESH ATTENDANCE UI
    // =====================================

    renderAttendanceHistory();

    loadAttendanceForDate();

    renderAttendanceSummary(
        document.getElementById(
            "attendanceSummarySearch"
        )?.value || ""
    );

    renderTopAttendance();

    refreshDashboardStatus();


    alert(
        `✅ ${
            actualServiceType === "midweek"
                ? "Midweek"
                : "Sunday"
        } attendance from ${date} is successfully deleted.`
    );

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
    data-attendance-manage="true"
    style="padding: 4px 8px; font-size: 12px;"
    onclick="loadAttendanceRecord('${record.date}', '${record.serviceType || "sunday"}')"
>
    ✏️ Load
</button>

<button
    type="button"
    class="secondary-btn"
    data-admin-only="true"
    style="padding: 4px 8px; font-size: 12px; color:#ef4444; border-color:#fca5a5;"
    onclick="deleteAttendance('${record.date}', '${record.serviceType || "sunday"}')"
>
    ✖ Delete
</button>
            </td>
        `;

    body.appendChild(tr);
    });


    // =====================================
    // APPLY ROLE PERMISSIONS
    // sa bagong Attendance History buttons
    // =====================================

    if (
        typeof applyRoleBasedUI === "function"
    ) {
        applyRoleBasedUI();
    }

}

// =====================================
// LOAD ATTENDANCE RECORD
// =====================================

function loadAttendanceRecord(date, serviceType) {

if (!canManageAttendance()) {

    alert(
        "You do not have permission to load attendance."
    );

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


// =====================================================
// CHURCHHQ SETTINGS
// COMPLETE SUPABASE BACKUP
// VERSION 7.0
// =====================================================

async function exportChurchData() {

    if (!requireAdmin()) {
        return;
    }

    try {

        console.log(
            "📦 Creating ChurchHQ Backup v7..."
        );


        // =====================================================
        // LOAD ALL OPERATIONAL TABLES
        // =====================================================

        const [

            membersResult,
            tasksResult,
            songsResult,
            servicesResult,
            attendanceResult,
            activitiesResult,
            annualActivitiesResult,
            announcementsResult,
            fileFoldersResult,
            leadersResult,
            ministriesResult,
            programPlansResult,
            programItemsResult,
            editorTagsResult

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
                .from("annual_activities")
                .select("*"),

            churchSupabase
                .from("announcements")
                .select("*"),

            churchSupabase
                .from("file_folders")
                .select("*"),

            churchSupabase
                .from("church_leaders")
                .select("*"),

            churchSupabase
                .from("ministries")
                .select("*"),

            churchSupabase
                .from("program_plans")
                .select("*"),

            churchSupabase
                .from("program_items")
                .select("*"),

            churchSupabase
                .from("editor_tags")
                .select("*")

        ]);


        // =====================================================
        // CHECK SUPABASE ERRORS
        // =====================================================

        const results = [

            ["members", membersResult],

            ["planner_tasks", tasksResult],

            ["songs", songsResult],

            ["service_records", servicesResult],

            [
                "attendance_records",
                attendanceResult
            ],

            ["activities", activitiesResult],

            [
                "annual_activities",
                annualActivitiesResult
            ],

            [
                "announcements",
                announcementsResult
            ],

            [
                "file_folders",
                fileFoldersResult
            ],

            [
                "church_leaders",
                leadersResult
            ],

            [
                "ministries",
                ministriesResult
            ],

            [
                "program_plans",
                programPlansResult
            ],

            [
                "program_items",
                programItemsResult
            ],

            [
                "editor_tags",
                editorTagsResult
            ]
        ];


        for (
            const [tableName, result]
            of results
        ) {

            if (!result) {

                throw new Error(
                    `No response received from ${tableName}.`
                );

            }


            if (result.error) {

                console.error(
                    `❌ Backup failed on ${tableName}:`,
                    result.error
                );

                alert(
                    `❌ Backup failed while reading ${tableName}.\n\n` +
                    (
                        result.error.message ||
                        "Unknown Supabase error."
                    )
                );

                return;

            }

        }


        // =====================================================
        // CREATE BACKUP OBJECT
        // =====================================================

        const backupData = {

            app:
                "ChurchHQ",

            version:
                "7.1",

            source:
                "Supabase",

            exportDate:
                new Date()
                    .toISOString(),

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

                annual_activities:
                    annualActivitiesResult.data || [],

                announcements:
                    announcementsResult.data || [],

                file_folders:
                    fileFoldersResult.data || [],

                church_leaders:
                    leadersResult.data || [],

                ministries:
                    ministriesResult.data || [],

                program_plans:
                    programPlansResult.data || [],

                program_items:
                    programItemsResult.data || [],

                editor_tags:
                    editorTagsResult.data || []

            }

        };


        // =====================================================
        // CREATE JSON DOWNLOAD
        // =====================================================

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
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const downloadAnchor =
            document.createElement(
                "a"
            );


        const today =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        downloadAnchor.href =
            url;


        downloadAnchor.download =
            `churchhq_backup_v7_${today}.json`;


        document.body.appendChild(
            downloadAnchor
        );


        downloadAnchor.click();


        downloadAnchor.remove();


        URL.revokeObjectURL(
            url
        );


        // =====================================================
        // SAVE LAST BACKUP DATE
        // =====================================================

        const backupTime =
            new Date()
                .toISOString();


        localStorage.setItem(
            "churchhq_last_backup",
            backupTime
        );


        if (
            typeof updateLastBackupDisplay ===
            "function"
        ) {

            updateLastBackupDisplay();

        }


        // =====================================================
        // AUDIT - EXPORT
        // =====================================================

        if (
            typeof writeAuditLog ===
            "function"
        ) {

            await writeAuditLog(

                "EXPORT",

                "Settings",

                "Exported complete ChurchHQ backup.",

                null,

                {

                    version:
                        "7.1",

                    members:
                        backupData.data
                            .members.length,

                    plannerTasks:
                        backupData.data
                            .planner_tasks.length,

                    songs:
                        backupData.data
                            .songs.length,

                    services:
                        backupData.data
                            .service_records.length,

                    attendance:
                        backupData.data
                            .attendance_records.length,

                    activities:
                        backupData.data
                            .activities.length,

                    annualActivities:
                        backupData.data
                            .annual_activities.length,

                    announcements:
                        backupData.data
                            .announcements.length,

                    fileFolders:
                        backupData.data
                            .file_folders.length,

                    churchLeaders:
                        backupData.data
                            .church_leaders.length,

                    ministries:
                        backupData.data
                            .ministries.length,

                    programPlans:
                        backupData.data
                            .program_plans.length,

                    program_items:
                        backupData.data
                            .program_items.length,

                    editor_tags:
                        backupData.data
                            .editor_tags.length

                }

            );

        }


        // =====================================================
        // CONSOLE SUMMARY
        // =====================================================

        console.log(
            "✅ ChurchHQ Backup v7 created:",
            {

                members:
                    backupData.data
                        .members.length,

                planner_tasks:
                    backupData.data
                        .planner_tasks.length,

                songs:
                    backupData.data
                        .songs.length,

                service_records:
                    backupData.data
                        .service_records.length,

                attendance_records:
                    backupData.data
                        .attendance_records.length,

                activities:
                    backupData.data
                        .activities.length,

                annual_activities:
                    backupData.data
                        .annual_activities.length,

                announcements:
                    backupData.data
                        .announcements.length,

                file_folders:
                    backupData.data
                        .file_folders.length,

                church_leaders:
                    backupData.data
                        .church_leaders.length,

                ministries:
                    backupData.data
                        .ministries.length,

                program_plans:
                    backupData.data
                        .program_plans.length,

                program_items:
                    backupData.data
                        .program_items.length

            }
        );


        alert(
            "✅ ChurchHQ complete backup downloaded successfully!"
        );


    } catch (error) {

        console.error(
            "❌ ChurchHQ backup error:",
            error
        );


        alert(
            "❌ Failed to create ChurchHQ backup.\n\n" +
            (
                error &&
                error.message
                    ? error.message
                    : "Unknown backup error."
            )
        );

    }

}
// =====================================================
// CHURCHHQ SETTINGS
// IMPORT / RESTORE COMPLETE BACKUP
// VERSION 7.0
// SUPPORTS OLD + NEW BACKUPS
// =====================================================

async function importChurchData(event) {

    if (!requireAdmin()) {
        return;
    }


    const input =
        event.target;


    const file =
        input.files &&
        input.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        async function(e) {

            try {

                // =====================================================
                // READ JSON
                // =====================================================

                const importedJSON =
                    JSON.parse(
                        e.target.result
                    );


                // =====================================================
                // BASIC VALIDATION
                // =====================================================

                if (
                    !importedJSON ||
                    importedJSON.app !==
                        "ChurchHQ" ||
                    !importedJSON.data ||
                    typeof importedJSON.data !==
                        "object"
                ) {

                    alert(
                        "❌ Invalid ChurchHQ backup file."
                    );

                    input.value =
                        "";

                    return;
                }


                const rawBackup =
                    importedJSON.data;


                // =====================================================
                // REQUIRED CORE TABLES
                //
                // We keep these as the minimum requirement
                // so older ChurchHQ backups still work.
                // =====================================================

                const validBackup =

                    Array.isArray(
                        rawBackup.members
                    ) &&

                    Array.isArray(
                        rawBackup.planner_tasks
                    ) &&

                    Array.isArray(
                        rawBackup.songs
                    ) &&

                    Array.isArray(
                        rawBackup.service_records
                    ) &&

                    Array.isArray(
                        rawBackup.attendance_records
                    );


                if (!validBackup) {

                    alert(
                        "❌ This is not a valid ChurchHQ backup file."
                    );

                    input.value =
                        "";

                    return;
                }


                // =====================================================
                // BACKWARD COMPATIBILITY
                //
                // Missing tables from older backups become [].
                // =====================================================

                const backup = {

                    members:
                        rawBackup.members || [],

                    planner_tasks:
                        rawBackup.planner_tasks || [],

                    songs:
                        rawBackup.songs || [],

                    service_records:
                        rawBackup.service_records || [],

                    attendance_records:
                        rawBackup.attendance_records || [],


                    activities:
                        Array.isArray(
                            rawBackup.activities
                        )
                            ? rawBackup.activities
                            : [],


                    annual_activities:
                        Array.isArray(
                            rawBackup.annual_activities
                        )
                            ? rawBackup.annual_activities
                            : [],


                    announcements:
                        Array.isArray(
                            rawBackup.announcements
                        )
                            ? rawBackup.announcements
                            : [],


                    file_folders:
                        Array.isArray(
                            rawBackup.file_folders
                        )
                            ? rawBackup.file_folders
                            : [],


                    church_leaders:
                        Array.isArray(
                            rawBackup.church_leaders
                        )
                            ? rawBackup.church_leaders
                            : [],


                    ministries:
                        Array.isArray(
                            rawBackup.ministries
                        )
                            ? rawBackup.ministries
                            : [],


                    // =====================================
                    // PROGRAM PLANNER v7
                    // =====================================

                    program_plans:
                        Array.isArray(
                            rawBackup.program_plans
                        )
                            ? rawBackup.program_plans
                            : [],


                    program_items:
                        Array.isArray(
                            rawBackup.program_items
                        )
                            ? rawBackup.program_items
                            : [],


                    editor_tags:
                        Array.isArray(
                            rawBackup.editor_tags
                        )
                            ? rawBackup.editor_tags
                            : []

                };


                // =====================================================
                // CONFIRM RESTORE
                // =====================================================

                const confirmed =
                    confirm(

                        "⚠️ RESTORE CHURCHHQ BACKUP?\n\n" +

                        "Existing records with the same IDs will be updated.\n" +

                        "Missing records from this backup will be added.\n\n" +

                        "Backup Version: " +
                        (
                            importedJSON.version ||
                            "Legacy"
                        ) +
                        "\n\n" +

                        "This restore can include:\n" +

                        "• Members\n" +
                        "• Planner Tasks\n" +
                        "• Songs\n" +
                        "• Sunday & Midweek Services\n" +
                        "• Program Planner\n" +
                        "• Program Assignments\n" +
                        "• Attendance\n" +
                        "• Dashboard Activities\n" +
                        "• Annual Activities\n" +
                        "• Announcements\n" +
                        "• File Folders\n" +
                        "• Church Leaders\n" +
                        "• Ministries\n\n" +

                        "User accounts, roles and Audit Logs will NOT be replaced.\n\n" +

                        "Continue?"

                    );


                if (!confirmed) {

                    input.value =
                        "";

                    return;
                }


                console.log(
                    "📤 Starting ChurchHQ restore..."
                );


                // =====================================================
                // RESTORE HELPER
                // =====================================================

                async function restoreTable(
                    tableName,
                    records
                ) {

                    if (
                        !Array.isArray(
                            records
                        ) ||
                        records.length === 0
                    ) {

                        console.log(
                            `ℹ️ ${tableName}: no records to restore.`
                        );

                        return;
                    }


                    const { error } =
                        await churchSupabase

                            .from(
                                tableName
                            )

                            .upsert(
                                records,
                                {
                                    onConflict:
                                        "id"
                                }
                            );


                    if (error) {

                        throw new Error(
                            `${tableName} restore failed: ${error.message}`
                        );

                    }


                    console.log(
                        `✅ Restored ${tableName}:`,
                        records.length
                    );

                }


                // =====================================================
                // RESTORE ORDER
                //
                // Parent/reference tables first.
                // program_plans MUST be before program_items.
                // =====================================================


                // 1. Ministries first

                await restoreTable(
                    "ministries",
                    backup.ministries
                );


                // 2. Members

                await restoreTable(
                    "members",
                    backup.members
                );


                // 3. Planner

                await restoreTable(
                    "planner_tasks",
                    backup.planner_tasks
                );


                // 4. Songs

                await restoreTable(
                    "songs",
                    backup.songs
                );


                // 5. Service Planner

                await restoreTable(
                    "service_records",
                    backup.service_records
                );


                // =====================================================
                // 6. PROGRAM PLANNER PARENT
                // =====================================================

                await restoreTable(
                    "program_plans",
                    backup.program_plans
                );


                // =====================================================
                // 7. PROGRAM PLANNER ITEMS
                //
                // Must come AFTER program_plans because
                // program_items.program_id points to program_plans.id
                // =====================================================
                
                await restoreTable(
                    "program_items",
                    backup.program_items
                );


                // =====================================
                // EDITOR TAGS
                // =====================================

                await restoreTable(
                    "editor_tags",
                    backup.editor_tags
                );


                // Attendance

                await restoreTable(
                    "attendance_records",
                    backup.attendance_records
                );


                // 9. Dashboard activities

                await restoreTable(
                    "activities",
                    backup.activities
                );


                // 10. Annual activities

                await restoreTable(
                    "annual_activities",
                    backup.annual_activities
                );


                // 11. Announcements

                await restoreTable(
                    "announcements",
                    backup.announcements
                );


                // 12. File folders

                await restoreTable(
                    "file_folders",
                    backup.file_folders
                );


                // 13. Church leaders

                await restoreTable(
                    "church_leaders",
                    backup.church_leaders
                );


                // =====================================================
                // AUDIT - IMPORT / RESTORE
                // =====================================================

                if (
                    typeof writeAuditLog ===
                    "function"
                ) {

                    await writeAuditLog(

                        "IMPORT",

                        "Settings",

                        "Restored ChurchHQ backup.",

                        null,

                        {

                            backupVersion:
                                importedJSON.version ||
                                "Legacy",

                            members:
                                backup.members.length,

                            plannerTasks:
                                backup.planner_tasks.length,

                            songs:
                                backup.songs.length,

                            services:
                                backup.service_records.length,

                            programPlans:
                                backup.program_plans.length,

                            programItems:
                                backup.program_items.length,

                            editorTags:
                                backup.editor_tags.length,

                            attendance:
                                backup.attendance_records.length,

                            activities:
                                backup.activities.length,

                            annualActivities:
                                backup.annual_activities.length,

                            announcements:
                                backup.announcements.length,

                            fileFolders:
                                backup.file_folders.length,

                            churchLeaders:
                                backup.church_leaders.length,

                            ministries:
                                backup.ministries.length

                        }

                    );

                }


                // =====================================================
                // RELOAD MAIN CHURCHHQ DATA
                // =====================================================

                if (
                    typeof initializeChurchHQ ===
                    "function"
                ) {

                    await initializeChurchHQ();

                }


                // =====================================================
                // RELOAD ACTIVITIES
                // =====================================================

                if (
                    typeof loadActivitiesFromSupabase ===
                    "function"
                ) {

                    await loadActivitiesFromSupabase();

                }


                // =====================================================
                // RELOAD ANNOUNCEMENTS
                // =====================================================

                if (
                    typeof loadAnnouncementsFromSupabase ===
                    "function"
                ) {

                    await loadAnnouncementsFromSupabase();

                }


                // =====================================================
                // RELOAD MINISTRIES
                // =====================================================

                if (
                    typeof loadMinistriesFromSupabase ===
                    "function"
                ) {

                    await loadMinistriesFromSupabase();

                }


                // =====================================================
                // RELOAD LEADERS
                // =====================================================

                if (
                    typeof loadLeadersFromSupabase ===
                    "function"
                ) {

                    await loadLeadersFromSupabase();

                }


                // =====================================================
                // RELOAD ANNUAL ACTIVITIES
                // =====================================================

                if (
                    typeof loadAnnualActivitiesFromSupabase ===
                    "function"
                ) {

                    await loadAnnualActivitiesFromSupabase();

                }


                // =====================================================
                // RELOAD FILE FOLDERS
                // =====================================================

                if (
                    typeof loadFileFoldersFromSupabase ===
                    "function"
                ) {

                    await loadFileFoldersFromSupabase();

                }


                // =====================================================
                // RELOAD PROGRAM PLANNER
                // =====================================================

                if (
                    typeof loadProgramPlans ===
                    "function"
                ) {

                    await loadProgramPlans();

                }


                // =====================================================
                // REFRESH DASHBOARD
                // =====================================================

                if (
                    typeof refreshDashboardStatus ===
                    "function"
                ) {

                    refreshDashboardStatus();

                }


                // =====================================================
                // COMPLETE
                // =====================================================

                input.value =
                    "";


                console.log(
                    "✅ ChurchHQ Backup restore completed.",
                    {

                        version:
                            importedJSON.version ||
                            "Legacy",

                        program_plans:
                            backup.program_plans.length,

                        program_items:
                            backup.program_items.length,

                        editor_tags:
                            backup.editor_tags.length
                    }
                );


                alert(
                    "✅ ChurchHQ backup restored successfully!"
                );


            } catch (error) {

                console.error(
                    "❌ ChurchHQ restore error:",
                    error
                );


                alert(
                    "❌ Restore failed:\n\n" +
                    (
                        error &&
                        error.message
                            ? error.message
                            : "Unknown restore error."
                    )
                );


                input.value =
                    "";

            }

        };


    // =====================================================
    // FILE READER ERROR
    // =====================================================

    reader.onerror =
        function() {

            console.error(
                "❌ Failed to read backup file."
            );


            alert(
                "❌ Unable to read the selected backup file."
            );


            input.value =
                "";

        };


    reader.readAsText(
        file
    );

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

// =====================================================
// CHURCHHQ SETTINGS
// CLEAR ALL OPERATIONAL CHURCH DATA
// FINAL VERSION 6.0
//
// PRESERVED:
// - AUTH / LOGIN ACCOUNTS
// - USER ROLES
// - AUDIT LOGS
// =====================================================

async function clearAllChurchData() {

    if (!requireAdmin()) {
        return;
    }


    // =====================================
    // FIRST CONFIRMATION
    // =====================================

    const firstConfirm =
        confirm(

            "🚨 WARNING - CLEAR ALL CHURCH DATA\n\n" +

            "This will permanently delete all ChurchHQ operational records.\n\n" +

            "DATA TO BE DELETED:\n\n" +

            "• Members\n" +
            "• Planner Tasks\n" +
            "• Songs\n" +
            "• Sunday & Midweek Services\n" +
            "• Program Planner\n" +
            "• Program Assignments\n" +
            "• Attendance Records\n" +
            "• Dashboard Activities\n" +
            "• Annual Activities\n" +
            "• Announcements\n" +
            "• File Folders\n" +
            "• Church Leaders\n" +
            "• Ministries\n\n" +

            "THE FOLLOWING WILL NOT BE DELETED:\n\n" +
            "• Login Accounts\n" +
            "• User Roles\n" +
            "• Audit Logs\n" +
            "• Editor Tags\n\n" +

            "Make sure you downloaded a backup first.\n\n" +

            "Do you want to continue?"

        );


    if (!firstConfirm) {

        console.log(
            "ℹ️ System reset cancelled."
        );

        return;
    }


    // =====================================
    // SECOND / FINAL CONFIRMATION
    // =====================================

    const confirmationText =
        prompt(

            "⚠️ FINAL CONFIRMATION\n\n" +

            "This action cannot be undone without a backup.\n\n" +

            "Type exactly:\n\n" +

            "DELETE ALL DATA"

        );


    if (
        confirmationText !==
        "DELETE ALL DATA"
    ) {

        alert(
            "❌ System reset cancelled.\n\n" +
            "Confirmation text did not match."
        );


        console.log(
            "ℹ️ System reset cancelled."
        );


        return;
    }


    try {

        console.log(
            "🗑️ Starting ChurchHQ System Reset..."
        );


        // =====================================
        // TABLES TO CLEAR
        //
        // IMPORTANT:
        // Dependent records are deleted first.
        // =====================================

        const tables = [

    // =====================================
    // DEPENDENT / CHILD TABLES FIRST
    // =====================================

    "program_items",

    "church_leaders",

    "attendance_records",


    // =====================================
    // PARENT / MAIN TABLES
    // =====================================

    "program_plans",

    "service_records",

    "planner_tasks",

    "songs",

    "activities",

    "annual_activities",

    "announcements",

    "file_folders",

    "members",

    "ministries"

];


        // =====================================
        // DELETE SUPABASE RECORDS
        // =====================================

        for (
            const tableName
            of tables
        ) {

            console.log(
                `🗑️ Clearing ${tableName}...`
            );


            const { error } =
                await churchSupabase
                    .from(
                        tableName
                    )
                    .delete()
                    .not(
                        "id",
                        "is",
                        null
                    );


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


        // =====================================
        // CLEAR LOCAL STORAGE CACHE
        // =====================================

        const localKeys = [

            "churchhq_tasks",

            "churchhq_songs",

            "churchhq_members",

            "churchhq_attendance",

            "churchhq_activities",

            "churchhq_announcements",

            "churchhq_sunday_services",

            "churchhq_midweek_services",

            "churchhq_sunday_lineup",

            "churchhq_leaders",

            "churchhq_ministries",

            "churchhq_annual_activities",

            "churchhq_file_folders"

        ];


        localKeys.forEach(
            key => {

                localStorage.removeItem(
                    key
                );

            }
        );


        // =====================================
        // RESET IN-MEMORY ARRAYS
        // =====================================

        if (
            typeof members !==
            "undefined"
        ) {

            members = [];

        }


        if (
            typeof tasks !==
            "undefined"
        ) {

            tasks = [];

        }


        if (
            typeof songs !==
            "undefined"
        ) {

            songs = [];

        }


        if (
            typeof activities !==
            "undefined"
        ) {

            activities = [];

        }


        if (
            typeof announcements !==
            "undefined"
        ) {

            announcements = [];

        }


        if (
            typeof churchLeaders !==
            "undefined"
        ) {

            churchLeaders = [];

        }


        if (
            typeof annualActivities !==
            "undefined"
        ) {

            annualActivities = [];

        }


        if (
            typeof ministries !==
            "undefined"
        ) {

            ministries = [];

        }


        if (
            typeof sundayServices !==
            "undefined"
        ) {

            sundayServices = [];

        }


        if (
            typeof midweekServices !==
            "undefined"
        ) {

            midweekServices = [];

        }


        if (
            typeof attendanceRecords !==
            "undefined"
        ) {

            attendanceRecords = [];

        }


        if (
            typeof fileFolders !==
            "undefined"
        ) {

            fileFolders = [];

        }

        // =====================================
// RESET PROGRAM PLANNER
// =====================================

if (
    typeof programPlans !==
    "undefined"
) {

    programPlans = [];

}


if (
    typeof programItems !==
    "undefined"
) {

    programItems = [];

}


if (
    typeof editingProgramId !==
    "undefined"
) {

    editingProgramId = null;

}


        // =====================================
        // AUDIT - SYSTEM RESET
        //
        // IMPORTANT:
        // audit_logs table was NOT cleared.
        // This records who performed the reset.
        // =====================================

        if (
            typeof writeAuditLog ===
            "function"
        ) {

            await writeAuditLog(
                "RESET",
                "Settings",
                "Cleared all ChurchHQ operational data.",
                null,
                {

                    version:
                        "7.1",

                    clearedTables:
                        tables,

                    preserved: [

                        "Authentication Users",

                        "User Roles",

                        "Audit Logs"

                    ]

                }
            );

        }


        // =====================================
        // SUCCESS
        // =====================================

        console.log(
            "✅ ChurchHQ System Reset completed."
        );


        alert(

            "✅ ChurchHQ data has been cleared successfully.\n\n" +

            "Login Accounts were preserved.\n" +

            "User Roles were preserved.\n" +

            "Audit Logs were preserved."

        );


        // =====================================
        // RELOAD APPLICATION
        // =====================================

        location.reload();


    } catch (error) {

        console.error(
            "❌ ChurchHQ System Reset failed:",
            error
        );


        alert(

            "❌ System Reset failed.\n\n" +

            error.message +

            "\n\n" +

            "IMPORTANT:\n" +

            "Some tables may already have been cleared.\n" +

            "Do not press Clear All again until the error is checked."

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
// RECENT ATTENDANCE SUMMARY
// =====================================

const recentAttendanceContainer =
    document.getElementById(
        "rep-attendance-history"
    );


if (recentAttendanceContainer) {

    recentAttendanceContainer.innerHTML =
        "";


    // =====================================
    // NO ATTENDANCE RECORDS
    // =====================================

    if (
        !Array.isArray(attendance) ||
        attendance.length === 0
    ) {

        recentAttendanceContainer.innerHTML = `

            <div
                style="
                    padding:20px;
                    text-align:center;
                    color:#94a3b8;
                    font-size:13px;
                "
            >
                No attendance records yet.
            </div>

        `;

    } else {


        // =====================================
        // RECENT 5 RECORDS
        // =====================================

        const recentAttendance =
            attendance.slice(
                0,
                5
            );


        recentAttendance.forEach(
            record => {


                // =====================================
                // PRESENT COUNT
                // =====================================

                let recordPresentCount =
                    0;


                if (
                    record.check_ins &&
                    typeof record.check_ins ===
                        "object"
                ) {

                    recordPresentCount =
                        Object.values(
                            record.check_ins
                        )
                        .filter(Boolean)
                        .length;

                } else {

                    recordPresentCount =
                        Number(
                            record.present_count || 0
                        );

                }


                // =====================================
                // TOTAL MEMBERS
                // =====================================

                const recordTotalMembers =
                    Number(
                        record.total_members || 0
                    );


                // =====================================
                // ATTENDANCE RATE
                // =====================================

                const attendanceRate =
                    recordTotalMembers > 0
                        ? Math.round(
                            (
                                recordPresentCount /
                                recordTotalMembers
                            ) * 100
                        )
                        : 0;


                // =====================================
                // SERVICE TYPE
                // =====================================

                const serviceType =
                    String(
                        record.service_type ||
                        "sunday"
                    )
                    .toLowerCase();


                const serviceLabel =
                    serviceType === "midweek"
                        ? "Midweek Service"
                        : "Sunday Service";


                // =====================================
                // EVENT NAME
                // =====================================

                const eventName =
                    record.event_name ||
                    serviceLabel;


                // =====================================
                // FORMAT DATE
                // =====================================

                let formattedDate =
                    record.date || "-";


                if (record.date) {

                    const dateObject =
                        new Date(
                            record.date +
                            "T00:00:00"
                        );


                    if (
                        !isNaN(
                            dateObject.getTime()
                        )
                    ) {

                        formattedDate =
                            dateObject
                                .toLocaleDateString(
                                    "en-US",
                                    {
                                        month:
                                            "short",

                                        day:
                                            "numeric",

                                        year:
                                            "numeric"
                                    }
                                );

                    }

                }


                // =====================================
                // CREATE ITEM
                // =====================================

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "recent-attendance-item";


                item.innerHTML = `

                    <div class="recent-attendance-info">

                        <strong>
                            ${eventName}
                        </strong>

                        <span>
                            ${serviceLabel}
                            •
                            ${formattedDate}
                        </span>

                    </div>


                    <div class="recent-attendance-result">

                        <strong>
                            ${recordPresentCount}
                            /
                            ${recordTotalMembers}
                        </strong>

                        <span>
                            ${attendanceRate}%
                        </span>

                    </div>

                `;


                recentAttendanceContainer
                    .appendChild(
                        item
                    );

            }
        );

    }

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
// PLANNER REPORTS
// ACCURATE STATUS COUNTS
// =====================================

const normalizedTasks =
    tasks.map(task => {

        const status =
            String(
                task.status || "todo"
            )
            .trim()
            .toLowerCase();

        return {
            ...task,
            normalizedStatus:
                status
        };

    });


// =====================================
// TOTAL TASKS
// =====================================

const totalTasks =
    normalizedTasks.length;


// =====================================
// TO DO
// =====================================

const todoTasks =
    normalizedTasks.filter(
        task =>
            task.normalizedStatus ===
            "todo"
    ).length;


// =====================================
// IN PROGRESS
// =====================================

const progressTasks =
    normalizedTasks.filter(
        task =>
            task.normalizedStatus ===
            "progress"
    ).length;


// =====================================
// COMPLETED
// =====================================

const completedTasks =
    normalizedTasks.filter(
        task =>
            task.normalizedStatus ===
            "completed"
    ).length;


// =====================================
// COMPLETION RATE
// =====================================

const progressRate =
    totalTasks > 0
        ? Math.round(
            (
                completedTasks /
                totalTasks
            ) * 100
        )
        : 0;


// =====================================
// PROGRESS PERCENT
// =====================================

const taskProgressEl =
    document.getElementById(
        "rep-task-progress"
    );


if (taskProgressEl) {

    taskProgressEl.textContent =
        `${progressRate}%`;

}


// =====================================
// TASK BREAKDOWN
// =====================================

const taskCountsEl =
    document.getElementById(
        "rep-task-counts"
    );


if (taskCountsEl) {

    if (totalTasks === 0) {

        taskCountsEl.textContent =
            "No planner tasks";

    } else {

        taskCountsEl.textContent =
            `${completedTasks} Completed • ${progressTasks} In Progress • ${todoTasks} To Do`;

    }

}


        // =====================================
// MEMBERS PER MINISTRY
// MULTI-MINISTRY COUNT
// =====================================

const ministryCounts = {};


// =====================================
// COUNT MEMBER IN ALL ASSIGNED MINISTRIES
// =====================================

members.forEach(member => {

    let memberMinistries = [];


    // =====================================
    // USE NEW MULTI-MINISTRY ARRAY FIRST
    // =====================================

    if (
        Array.isArray(member.ministries) &&
        member.ministries.length > 0
    ) {

        memberMinistries =
            member.ministries
                .map(ministry =>
                    String(
                        ministry || ""
                    ).trim()
                )
                .filter(Boolean);

    }


    // =====================================
    // FALLBACK TO OLD PRIMARY MINISTRY
    // =====================================

    else if (
        member.ministry &&
        String(member.ministry).trim()
    ) {

        memberMinistries = [
            String(
                member.ministry
            ).trim()
        ];

    }


    // =====================================
    // NO MINISTRY
    // =====================================

    else {

        memberMinistries = [
            "Unassigned"
        ];

    }


    // =====================================
    // REMOVE DUPLICATES PER MEMBER
    // =====================================

    const uniqueMinistries =
        [
            ...new Set(
                memberMinistries
            )
        ];


    // =====================================
    // COUNT EACH MINISTRY
    // =====================================

    uniqueMinistries.forEach(
        ministry => {

            ministryCounts[ministry] =
                (
                    ministryCounts[ministry] ||
                    0
                ) + 1;

        }
    );

});


// =====================================
// MINISTRY REPORT CONTAINER
// =====================================

const ministryContainer =
    document.getElementById(
        "rep-ministry-list"
    );


if (ministryContainer) {

    ministryContainer.innerHTML = "";


    // =====================================
    // NO DATA
    // =====================================

    if (
        Object.keys(
            ministryCounts
        ).length === 0
    ) {

        ministryContainer.innerHTML = `

            <p
                style="
                    color:#9ca3af;
                    font-size:14px;
                "
            >
                No member data available.
            </p>

        `;

    } else {


        // =====================================
        // SORT MINISTRIES
        // HIGHEST COUNT FIRST
        // =====================================

        const sortedMinistries =
            Object.entries(
                ministryCounts
            )
            .sort(
                (a, b) => {

                    if (
                        b[1] !== a[1]
                    ) {

                        return (
                            b[1] -
                            a[1]
                        );

                    }


                    return String(
                        a[0]
                    ).localeCompare(
                        String(
                            b[0]
                        ),
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    );

                }
            );


        sortedMinistries.forEach(
            ([ministry, count]) => {


                // =====================================
                // PERCENT OF TOTAL UNIQUE MEMBERS
                // =====================================

                const percentage =
                    totalMembers > 0
                        ? Math.round(
                            (
                                count /
                                totalMembers
                            ) * 100
                        )
                        : 0;


                ministryContainer.innerHTML += `

                    <div>

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                gap:12px;
                                font-size:13px;
                                font-weight:500;
                                margin-bottom:4px;
                            "
                        >

                            <span>
                                ${ministry}
                            </span>


                            <span
                                style="
                                    color:#6b7280;
                                    white-space:nowrap;
                                "
                            >
                                ${count}
                                member${count === 1 ? "" : "s"}
                                (${percentage}%)
                            </span>

                        </div>


                        <div
                            style="
                                background-color:#e5e7eb;
                                height:8px;
                                border-radius:4px;
                                overflow:hidden;
                            "
                        >

                            <div
                                style="
                                    background-color:#2563eb;
                                    width:${Math.min(
                                        percentage,
                                        100
                                    )}%;
                                    height:100%;
                                    border-radius:4px;
                                "
                            ></div>

                        </div>

                    </div>

                `;

            }
        );

    }

}
// =====================================
// REPORT LOAD COMPLETE
// =====================================

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

async function addNewActivityItem() {

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

// =====================================
// SUPABASE INSERT
// =====================================

const saved =
    await saveActivityToSupabase(
        newActivity
    );

if (!saved) {

    alert(
        "❌ Failed to save activity."
    );

    return;
}

// =====================================
// AUDIT - ADD ACTIVITY
// =====================================

await writeAuditLog(
    "ADD",
    "Activities",
    `Added activity: ${newActivity.title}`,
    newActivity.id,
    {
        title:
            newActivity.title,

        date:
            newActivity.date
    }
);

    activities.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    localStorage.setItem(
    "churchhq_activities",
    JSON.stringify(activities)
    );

    renderManageModalContent();
    renderDashboardLists();

    await loadEventCountFromSupabase();

    refreshDashboardStatus();

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

    document.getElementById(
    "saveEditBtn"
).onclick =
    async function() {

        let newTitle =
            document
                .getElementById(
                    "editActTitleInput"
                )
                .value
                .trim();


        let newDate =
            document
                .getElementById(
                    "editActDateInput"
                )
                .value
                .trim();


        if (
            !newTitle ||
            !newDate
        ) {

            alert(
                "Pakipunan ang pamagat at petsa."
            );

            return;
        }


        act.title =
            newTitle;

        act.date =
            newDate;


        // =====================================
        // SUPABASE UPDATE
        // =====================================

        const updated =
            await updateActivityToSupabase(
                act
            );


        if (!updated) {

            alert(
                "❌ Failed to update activity in Supabase."
            );

            return;
        }


        // =====================================
        // AUDIT - EDIT ACTIVITY
        // =====================================

        await writeAuditLog(
            "EDIT",
            "Activities",
            `Updated activity: ${act.title}`,
            act.id,
            {
                title:
                    act.title,

                date:
                    act.date
            }
        );


        activities.sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


        localStorage.setItem(
            "churchhq_activities",
            JSON.stringify(
                activities
            )
        );


        customModal.style.display =
            "none";


        renderManageModalContent();

        renderDashboardLists();

        refreshDashboardStatus();

    };

    document.getElementById(
        "cancelEditBtn"
    ).onclick =
        function() {

            customModal.style.display =
                "none";

        };

}

async function deleteActivityItem(id) {

    if (!requireAdmin()) {
        return;
    }

    let activityToDelete = null;

try {

    const savedActivities =
        JSON.parse(
            localStorage.getItem(
                "churchhq_activities"
            )
        ) || [];


    activityToDelete =
        savedActivities.find(
            activity =>
                String(activity.id) ===
                String(id)
        ) || null;

} catch (e) {

    activityToDelete = null;

}

    if (
        !confirm(
            "Are you sure you want to delete this?"
        )
    ) {

        return;
    }



    const deletedFromSupabase =
        await deleteActivityFromSupabase(id);


    if (!deletedFromSupabase) {

        alert(
            "❌ Failed to delete the activity in Supabase."
        );

        return;
    }

    // =====================================
// AUDIT - DELETE ACTIVITY
// =====================================

await writeAuditLog(
    "DELETE",
    "Activities",
    `Deleted activity: ${
        activityToDelete?.title ||
        "Unknown Activity"
    }`,
    id,
    {
        title:
            activityToDelete?.title || "",

        date:
            activityToDelete?.date || ""
    }
);

    let activities = [];

    try {

        activities =
            JSON.parse(
                localStorage.getItem(
                    "churchhq_activities"
                )
            ) || [];

    } catch (e) {

        activities = [];

    }


    activities =
        activities.filter(
            activity =>
                activity.id !== id
        );


    localStorage.setItem(
        "churchhq_activities",
        JSON.stringify(activities)
    );


    renderManageModalContent();
    renderDashboardLists();

    refreshDashboardStatus();

    applyRoleBasedUI();

}

async function addNewAnnouncementItem() {
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
const saved =
    await saveAnnouncementToSupabase(
        newAnnouncement
    );


if (!saved) {

    alert(
        "❌ Failed to save announcement."
    );

    return;
}


// =====================================
// AUDIT - ADD ANNOUNCEMENT
// =====================================

await writeAuditLog(
    "ADD",
    "Announcements",
    `Added announcement: ${newAnnouncement.text}`,
    newAnnouncement.id,
    {
        text:
            newAnnouncement.text
    }
);
    localStorage.setItem("churchhq_announcements", JSON.stringify(announcements));
    renderManageModalContent();
    renderDashboardLists();
    refreshDashboardStatus();
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


            // =====================================
// AUDIT - EDIT ANNOUNCEMENT
// =====================================

await writeAuditLog(
    "EDIT",
    "Announcements",
    `Updated announcement: ${ann.text}`,
    ann.id,
    {
        text:
            ann.text
    }
);

            // LOCAL STORAGE
            localStorage.setItem(
                "churchhq_announcements",
                JSON.stringify(announcements)
            );

            customAnnModal.style.display = "none";

                        renderManageModalContent();
            renderDashboardLists();
            refreshDashboardStatus();
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

    let announcementToDelete = null;

try {

    const savedAnnouncements =
        JSON.parse(
            localStorage.getItem(
                "churchhq_announcements"
            )
        ) || [];


    announcementToDelete =
        savedAnnouncements.find(
            announcement =>
                String(
                    announcement.id
                ) ===
                String(id)
        ) || null;

} catch (e) {

    announcementToDelete =
        null;

}

    // SUPABASE DELETE
    const deleted =
        await deleteAnnouncementFromSupabase(id);

    if (!deleted) {
        alert(
            "❌ Failed to delete the announcement in Supabase"
        );
        return;
    }

    // =====================================
// AUDIT - DELETE ANNOUNCEMENT
// =====================================

await writeAuditLog(
    "DELETE",
    "Announcements",
    `Deleted announcement: ${
        announcementToDelete?.text ||
        "Unknown Announcement"
    }`,
    id,
    {
        text:
            announcementToDelete?.text || ""
    }
);

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
    refreshDashboardStatus();
}

// =========================================
// DASHBOARD ACTIVITIES + ANNOUNCEMENTS
// =========================================

function renderDashboardLists() {

    const actList =
        document.getElementById(
            "dashboardActivities"
        );

    const annList =
        document.getElementById(
            "dashboardAnnouncements"
        );


    // =====================================
    // UPCOMING ANNUAL ACTIVITIES
    // =====================================

    if (actList) {

        const today =
            new Date();

        today.setHours(
            0, 0, 0, 0
        );


        const upcomingActivities =
            (Array.isArray(annualActivities)
                ? [...annualActivities]
                : []
            )

            .filter(activity => {

                if (!activity.date) {
                    return false;
                }

                const activityDate =
                    new Date(
                        activity.date +
                        "T00:00:00"
                    );

                activityDate.setHours(
                    0, 0, 0, 0
                );

                return (
                    activityDate >= today
                );

            })

            .sort(
                (a, b) =>
                    String(a.date)
                        .localeCompare(
                            String(b.date)
                        )
            )

            // 3 NEAREST FUTURE ACTIVITIES
            .slice(0, 3);


        if (
            upcomingActivities.length === 0
        ) {

            actList.innerHTML = `

                <li
                    style="
                        color:#94a3b8;
                        padding:10px 0;
                    "
                >
                    No upcoming activities.
                </li>

            `;

        } else {

            actList.innerHTML =
                upcomingActivities
                    .map(activity => {

                        const activityDate =
                            new Date(
                                activity.date +
                                "T00:00:00"
                            );


                        const formattedDate =
                            activityDate
                                .toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    }
                                );

const todayDate =
    new Date();

todayDate.setHours(
    0, 0, 0, 0
);

const activityOnlyDate =
    new Date(
        activity.date +
        "T00:00:00"
    );

activityOnlyDate.setHours(
    0, 0, 0, 0
);

const daysLeft =
    Math.round(
        (
            activityOnlyDate -
            todayDate
        ) /
        (
            1000 *
            60 *
            60 *
            24
        )
    );


let daysText = "";

if (daysLeft === 0) {

    daysText =
        "Today";

} else if (daysLeft === 1) {

    daysText =
        "Tomorrow";

} else {

    daysText =
        `${daysLeft} days left`;

}


return `

    <li class="dashboard-activity-item">

        <div class="dashboard-activity-main">

            <strong class="dashboard-activity-title">
                ${
                    activity.title ||
                    "Untitled Activity"
                }
            </strong>

            <span class="dashboard-activity-date">
                ${formattedDate}
            </span>

        </div>

        <div class="dashboard-activity-days">
            ${daysText}
        </div>

    </li>

`;
                    })
                    .join("");

        }

    }


    // =====================================
    // ANNOUNCEMENTS
    // =====================================

    if (annList) {

        let announcements = [];


        try {

            announcements =
                JSON.parse(
                    localStorage.getItem(
                        "churchhq_announcements"
                    )
                ) || [];

        } catch (error) {

            announcements = [];

        }


        if (
            announcements.length === 0
        ) {

            annList.innerHTML = `
                <li>
                    No announcements.
                </li>
            `;

        } else {

            annList.innerHTML =
                announcements
                    .map(
                        announcement => `
                            <li>
                                ${announcement.text || ""}
                            </li>
                        `
                    )
                    .join("");

        }

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

    const midSelect =
        document.getElementById(
            "midGenDateSelect"
        );

    let serviceData = null;


    // =====================================
    // GET SAVED MIDWEEK RECORD
    // =====================================

    if (
        midSelect &&
        midSelect.value !== ""
    ) {

        const index =
            Number(
                midSelect.value
            );

        serviceData =
            midweekServices[index];

    }


    // =====================================
    // FALLBACK TO CURRENT FORM
    // =====================================

    const prefix = "mid_";


    const getVal =
        (fieldId) => {

            const el =
                document.getElementById(
                    prefix + fieldId
                );

            return el
                ? el.value.trim()
                : "";

        };


    // =====================================
    // VALUES
    // =====================================

    const dateVal =
        serviceData
            ? serviceData.date
            : getVal(
                "serviceDate"
            );


    const pptOperator =
        serviceData
            ? (
                serviceData.pptOperator ||
                ""
            )
            : getVal(
                "pptOperator"
            );


    const soundEngineer =
        serviceData
            ? (
                serviceData.soundEngineer ||
                ""
            )
            : getVal(
                "soundEngineer"
            );


    const liveStream =
        serviceData
            ? (
                serviceData.liveStream ||
                ""
            )
            : getVal(
                "liveStream"
            );


    const speaker =
        serviceData
            ? (
                serviceData.preacher ||
                "To be announced"
            )
            : (
                getVal("preacher") ||
                "To be announced"
            );


    const messageTitle =
        serviceData
            ? (
                serviceData.messageTitle ||
                "Midweek Message"
            )
            : (
                getVal("messageTitle") ||
                "Midweek Message"
            );


    // =====================================
    // FORMAT DATE
    // =====================================

    let formattedDate = "";


    if (dateVal) {

        const parsedDate =
            new Date(
                dateVal + "T00:00:00"
            );


        if (
            !isNaN(
                parsedDate.getTime()
            )
        ) {

            formattedDate =
                parsedDate
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
                    );

        }

    }


    if (!formattedDate) {

        formattedDate =
            new Date()
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
                );

    }


    // =====================================
    // STREAM TITLE
    // =====================================

    const streamTitle =
        `COJTGK Midweek Service - ${formattedDate}`;



    // =====================================
    // STREAM DESCRIPTION
    // =====================================

    const streamDesc =
`COJTGK Midweek Service - ${formattedDate}
——————————

𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗼𝘂𝗿 𝗠𝗶𝗱𝘄𝗲𝗲𝗸 𝗦𝗲𝗿𝘃𝗶𝗰𝗲!

Join us as we gather together to study God's Word, pray, and encourage one another in faith.

𝐓𝐎𝐃𝐀𝐘'𝐒 𝐌𝐄𝐒𝐒𝐀𝐆𝐄
Speaker: ${speaker}
Title: ${messageTitle}

Church of Jesus the Glorious King, Inc. (COJTGK)
Recorded Live || Midweek Service || ${formattedDate}

——————————
𝑺𝑻𝑨𝒀 𝑪𝑶𝑵𝑵𝑬𝑪𝑻𝑬𝑫
FB: facebook.com/COJTGKofficial
YT: youtube.com/@cojtgkofficial

#COJTGK #MidweekService #WordOfGod`;


    // =====================================
    // OUTPUT
    // =====================================

    const outTitle =
        document.getElementById(
            "outputMidweekTitle"
        );


    const outDesc =
        document.getElementById(
            "outputMidweekDesc"
        );


    if (outTitle) {

        outTitle.value =
            streamTitle;

    }


    if (outDesc) {

        outDesc.value =
            streamDesc;

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
// FILE FOLDERS - SUPABASE READ
// =====================================

let fileFolders = [];


async function loadFileFoldersFromSupabase() {

    try {

        const { data, error } =
            await churchSupabase
                .from("file_folders")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "❌ Failed to load file folders:",
                error
            );

            return false;

        }


        fileFolders = data || [];


        renderFileFolders();


        console.log(
            "✅ File folders loaded:",
            fileFolders
        );


        return true;


    } catch (error) {

        console.error(
            "❌ File folder loading error:",
            error
        );

        return false;

    }

}

function renderFileFolders() {


    const container =
        document.getElementById(
            "filesGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    fileFolders.forEach(folder => {


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "file-folder-card";


        card.innerHTML = `

    <div class="file-icon">
        ${folder.icon || "📁"}
    </div>

    <h3>
        ${folder.name}
    </h3>

    <p>
        ${folder.description || ""}
    </p>

    <button
        class="primary-btn"
        onclick="openDriveFolder('${folder.drive_link}')"
    >
        Open Folder
    </button>


    ${currentUserRole === "admin" ? `

        <button
            class="secondary-btn"
            onclick="openEditFileFolderModal(${folder.id})"
        >
            ✏️ Edit
        </button>

    ` : ""}

`;

        container.appendChild(card);


    });

}

function openEditFileFolderModal(folderId) {

    if (!requireAdmin()) {
        return;
    }


    const folder =
        fileFolders.find(
            item =>
                Number(item.id) ===
                Number(folderId)
        );


    if (!folder) {

        alert(
            "Folder not found."
        );

        return;
    }


    document.getElementById(
        "fileFolderModalTitle"
    ).textContent =
        "Edit Folder";


    document.getElementById(
        "editFileFolderId"
    ).value =
        folder.id;


    document.getElementById(
        "fileFolderName"
    ).value =
        folder.name || "";


    document.getElementById(
        "fileFolderIcon"
    ).value =
        folder.icon || "📁";


    document.getElementById(
        "fileFolderDescription"
    ).value =
        folder.description || "";


    document.getElementById(
        "fileFolderDriveLink"
    ).value =
        folder.drive_link || "";


    fileFolderModal.classList.remove(
        "hidden"
    );

}

function openDriveFolder(link) {


    if (!link) {

        alert(
            "Google Drive link is not available yet."
        );

        return;

    }


    window.open(
        link,
        "_blank"
    );


}

// =====================================
// FILE FOLDER MODAL
// =====================================

const fileFolderModal =
    document.getElementById(
        "fileFolderModal"
    );

const addFileFolderBtn =
    document.getElementById(
        "addFileFolderBtn"
    );

const closeFileFolderModal =
    document.getElementById(
        "closeFileFolderModal"
    );

const cancelFileFolderBtn =
    document.getElementById(
        "cancelFileFolderBtn"
    );


// =====================================
// OPEN ADD FOLDER MODAL
// =====================================

function openAddFileFolderModal() {

    if (!requireAdmin()) {
        return;
    }


    document.getElementById(
        "fileFolderModalTitle"
    ).textContent =
        "Add Folder";


    document.getElementById(
        "editFileFolderId"
    ).value = "";


    document.getElementById(
        "fileFolderName"
    ).value = "";


    document.getElementById(
        "fileFolderIcon"
    ).value = "📁";


    document.getElementById(
        "fileFolderDescription"
    ).value = "";


    document.getElementById(
        "fileFolderDriveLink"
    ).value = "";


    if (fileFolderModal) {

        fileFolderModal.classList.remove(
            "hidden"
        );

    }

}


// =====================================
// CLOSE FOLDER MODAL
// =====================================

function closeFileFolderModalWindow() {

    if (fileFolderModal) {

        fileFolderModal.classList.add(
            "hidden"
        );

    }

}


if (addFileFolderBtn) {

    addFileFolderBtn.addEventListener(
        "click",
        openAddFileFolderModal
    );

}


if (closeFileFolderModal) {

    closeFileFolderModal.addEventListener(
        "click",
        closeFileFolderModalWindow
    );

}


if (cancelFileFolderBtn) {

    cancelFileFolderBtn.addEventListener(
        "click",
        closeFileFolderModalWindow
    );

}

// =====================================
// FILE FOLDER SAVE / UPDATE
// PHASE 3C
// =====================================

const saveFileFolderBtn =
    document.getElementById(
        "saveFileFolderBtn"
    );


async function saveFileFolder() {

    if (!requireAdmin()) {
        return;
    }



    const id =
        document.getElementById(
            "editFileFolderId"
        ).value;


    const name =
        document.getElementById(
            "fileFolderName"
        ).value.trim();


    const icon =
        document.getElementById(
            "fileFolderIcon"
        ).value.trim() || "📁";


    const description =
        document.getElementById(
            "fileFolderDescription"
        ).value.trim();


    const driveLink =
        document.getElementById(
            "fileFolderDriveLink"
        ).value.trim();


    if (!name) {

        alert(
            "Please enter a folder name."
        );

        return;
    }


    try {

        // =====================================
        // EDIT EXISTING FOLDER
        // =====================================

        if (id) {

            const { error } =
                await churchSupabase
                    .from("file_folders")
                    .update({
                        name,
                        icon,
                        description,
                        drive_link:
                            driveLink
                    })
                    .eq(
                        "id",
                        Number(id)
                    );


            if (error) {

                console.error(
                    "❌ Folder update failed:",
                    error
                );

                alert(
                    "❌ Failed to update folder."
                );

                return;
            }


            alert(
                "✅ Folder updated successfully."
            );


        // =====================================
        // ADD NEW FOLDER
        // =====================================

        } else {

            const { error } =
                await churchSupabase
                    .from("file_folders")
                    .insert([
                        {
                            name,
                            icon,
                            description,
                            drive_link:
                                driveLink
                        }
                    ]);


            if (error) {

                console.error(
                    "❌ Folder insert failed:",
                    error
                );

                alert(
                    "❌ Failed to add folder."
                );

                return;
            }


            alert(
                "✅ Folder added successfully."
            );

        }


        closeFileFolderModalWindow();

        await loadFileFoldersFromSupabase();

        refreshDashboardStatus();

    } catch (error) {

        console.error(
            "❌ File folder save error:",
            error
        );

        alert(
            "❌ Something went wrong."
        );

    }

}


if (saveFileFolderBtn) {

    saveFileFolderBtn.addEventListener(
        "click",
        saveFileFolder
    );

}

// =====================================
// DASHBOARD AUTO REFRESH
// =====================================

function refreshDashboardStatus() {

    // System Status & Alerts
    if (
        typeof renderSystemStatusAlerts === "function"
    ) {
        renderSystemStatusAlerts();
    }


    // Dashboard birthday list
    if (
        typeof loadDashboardBirthdays === "function"
    ) {
        loadDashboardBirthdays();
    }


    // Planner pending count
    if (
        typeof updateCounters === "function"
    ) {
        updateCounters();
    }


    // Activities / announcements
    if (
        typeof renderDashboardLists === "function"
    ) {
        renderDashboardLists();
    }

    // Events this month
    if (
        typeof loadEventCountFromSupabase === "function"
    ) {
        loadEventCountFromSupabase();
    }

    // Ministry dashboard
    if (
        typeof populateMinistryDashboardSelect === "function"
    ) {
        populateMinistryDashboardSelect();
    }


    console.log(
        "🔄 Dashboard refreshed."
    );

}

async function initializeChurchHQ() {

    console.log("🚀 Initializing ChurchHQ from Supabase...");

    try {

        await testSupabaseConnection();

        await loadMinistriesFromSupabase();
        await loadMembersFromSupabase();
        await loadLeadersFromSupabase();
        await loadTasksFromSupabase();


        await loadAnnualActivitiesFromSupabase();
        await loadServicesFromSupabase();
        await loadSongsFromSupabase();
        await loadActivitiesFromSupabase();
        await loadAnnouncementsFromSupabase();
        await loadAttendanceFromSupabase();
        await loadFileFoldersFromSupabase();


        // =====================================
        // REFRESH DASHBOARD DATA
        // =====================================

        refreshDashboardStatus();


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


// =====================================
// AUDIT - LOGIN
// =====================================

const loginAuditSaved =
    await writeAuditLog(
        "LOGIN",
        "Authentication",
        `${currentUserRole || "Unknown"} account logged in.`
    );


console.log(
    "LOGIN AUDIT RESULT:",
    loginAuditSaved
);


applyRoleBasedUI();

await initializeChurchHQ();


}


// =====================================================
// LOAD AUDIT LOGS FROM SUPABASE
// ADMIN ONLY
// =====================================================

async function loadAuditLogsFromSupabase() {

    if (!isAdminUser()) {
        return false;
    }


    try {

        const { data, error } =
            await churchSupabase
                .from("audit_logs")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(500);


        if (error) {

            console.error(
                "❌ Failed to load audit logs:",
                error
            );

            return false;
        }


        auditLogs =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "✅ Audit logs loaded:",
            auditLogs.length
        );


        if (
            typeof populateAuditModuleFilter ===
            "function"
        ) {

            populateAuditModuleFilter();

        }


        if (
            typeof renderAuditLogs ===
            "function"
        ) {

            renderAuditLogs();

        }


        return true;


    } catch (error) {

        console.error(
            "❌ Audit log read error:",
            error
        );

        return false;
    }

}

// =====================================================
// POPULATE AUDIT MODULE FILTER
// =====================================================

function populateAuditModuleFilter() {

    const select =
        document.getElementById(
            "auditModuleFilter"
        );

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    const modules =
        [
            ...new Set(
                auditLogs
                    .map(
                        log =>
                            log.module || ""
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    select.innerHTML = `
        <option value="">
            All Modules
        </option>
    `;


    modules.forEach(module => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            module;

        option.textContent =
            module;

        select.appendChild(
            option
        );

    });


    if (
        modules.includes(
            currentValue
        )
    ) {
        select.value =
            currentValue;
    }

}

// =====================================================
// RENDER AUDIT LOGS
// =====================================================

function renderAuditLogs() {

    const body =
        document.getElementById(
            "auditLogBody"
        );

    if (!body) {
        console.warn(
            "⚠️ auditLogBody not found."
        );
        return;
    }


    const search =
        (
            document.getElementById(
                "auditSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const roleFilter =
        document.getElementById(
            "auditRoleFilter"
        )?.value || "";


    const moduleFilter =
        document.getElementById(
            "auditModuleFilter"
        )?.value || "";


    const dateFilter =
        document.getElementById(
            "auditDateFilter"
        )?.value || "";


    // =====================================
    // FILTER
    // =====================================

    const filteredLogs =
        auditLogs.filter(log => {

            const searchText =
                [
                    log.user_email || "",
                    log.user_role || "",
                    log.action || "",
                    log.module || "",
                    log.description || ""
                ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchText.includes(search);


            const matchesRole =
                !roleFilter ||
                log.user_role === roleFilter;


            const matchesModule =
                !moduleFilter ||
                log.module === moduleFilter;


            let matchesDate = true;


            if (
                dateFilter &&
                log.created_at
            ) {

                const d =
                    new Date(
                        log.created_at
                    );

                const localDate =
                    `${d.getFullYear()}-${String(
                        d.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        d.getDate()
                    ).padStart(2, "0")}`;

                matchesDate =
                    localDate === dateFilter;
            }


            return (
                matchesSearch &&
                matchesRole &&
                matchesModule &&
                matchesDate
            );

        });


    // =====================================
    // PAGINATION
    // =====================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredLogs.length /
                auditPageSize
            )
        );


    if (
        auditCurrentPage >
        totalPages
    ) {
        auditCurrentPage =
            totalPages;
    }


    if (
        auditCurrentPage < 1
    ) {
        auditCurrentPage = 1;
    }


    const startIndex =
        (auditCurrentPage - 1) *
        auditPageSize;


    const visibleLogs =
        filteredLogs.slice(
            startIndex,
            startIndex +
            auditPageSize
        );


    // =====================================
    // CLEAR TABLE
    // =====================================

    body.innerHTML = "";


    // =====================================
    // EMPTY STATE
    // =====================================

    if (
        filteredLogs.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        padding:20px;
                        text-align:center;
                        color:#9ca3af;
                    "
                >
                    No audit records found.
                </td>

            </tr>

        `;


        const pageInfo =
            document.getElementById(
                "auditPageInfo"
            );


        if (pageInfo) {
            pageInfo.textContent =
                "Page 1 of 1";
        }


        console.log(
            "📋 Audit rows rendered: 0"
        );

        return;
    }


    // =====================================
    // RENDER CURRENT PAGE ONLY
    // =====================================

    visibleLogs.forEach(log => {

        const tr =
            document.createElement(
                "tr"
            );


        tr.style.borderBottom =
            "1px solid #e5e7eb";


        const dateText =
            log.created_at
                ? new Date(
                    log.created_at
                ).toLocaleString()
                : "-";


        tr.innerHTML = `

            <td style="padding:12px;">
                ${dateText}
            </td>

            <td style="padding:12px;">
                ${log.user_email || "-"}
            </td>

            <td style="padding:12px;">
                ${log.user_role || "-"}
            </td>

            <td style="padding:12px;">
                <strong>
                    ${log.action || "-"}
                </strong>
            </td>

            <td style="padding:12px;">
                ${log.module || "-"}
            </td>

            <td style="padding:12px;">
                ${log.description || "-"}
            </td>

        `;


        body.appendChild(
            tr
        );

    });


    // =====================================
    // PAGE INFO
    // =====================================

    const pageInfo =
        document.getElementById(
            "auditPageInfo"
        );


    if (pageInfo) {

        pageInfo.textContent =
            `Page ${auditCurrentPage} of ${totalPages}`;

    }


    console.log(
        "📋 Audit rows rendered:",
        visibleLogs.length,
        "of",
        filteredLogs.length
    );

}

function changeAuditPage(direction) {

    const search =
        (
            document.getElementById(
                "auditSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const roleFilter =
        document.getElementById(
            "auditRoleFilter"
        )?.value || "";


    const moduleFilter =
        document.getElementById(
            "auditModuleFilter"
        )?.value || "";


    const dateFilter =
        document.getElementById(
            "auditDateFilter"
        )?.value || "";


    const filteredLogs =
        auditLogs.filter(log => {

            const searchText =
                [
                    log.user_email || "",
                    log.user_role || "",
                    log.action || "",
                    log.module || "",
                    log.description || ""
                ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchText.includes(search);


            const matchesRole =
                !roleFilter ||
                log.user_role === roleFilter;


            const matchesModule =
                !moduleFilter ||
                log.module === moduleFilter;


            let matchesDate = true;


            if (
                dateFilter &&
                log.created_at
            ) {

                const d =
                    new Date(
                        log.created_at
                    );


                const localDate =
                    `${d.getFullYear()}-${String(
                        d.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        d.getDate()
                    ).padStart(2, "0")}`;


                matchesDate =
                    localDate === dateFilter;

            }


            return (
                matchesSearch &&
                matchesRole &&
                matchesModule &&
                matchesDate
            );

        });


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredLogs.length /
                auditPageSize
            )
        );


    auditCurrentPage += direction;


    if (auditCurrentPage < 1) {
        auditCurrentPage = 1;
    }


    if (
        auditCurrentPage >
        totalPages
    ) {
        auditCurrentPage = totalPages;
    }


    renderAuditLogs();

}

// =====================================================
// CLEAR ALL AUDIT LOGS
// ADMIN ONLY
// =====================================================

async function clearAuditLogs() {

    if (!requireAdmin()) {
        return;
    }


    const confirmed =
        confirm(
            "Clear all audit logs?\n\n" +
            "This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        const { error } =
            await churchSupabase
                .from("audit_logs")
                .delete()
                .neq("id", 0);


        if (error) {

            console.error(
                "❌ Failed to clear audit logs:",
                error
            );

            alert(
                "❌ Failed to clear audit logs."
            );

            return;
        }


        auditLogs = [];

        auditCurrentPage = 1;


        renderAuditLogs();


        alert(
            "✅ Audit logs cleared successfully."
        );


        console.log(
            "🗑️ Audit logs cleared."
        );


    } catch (error) {

        console.error(
            "❌ Clear audit logs error:",
            error
        );

        alert(
            "❌ Failed to clear audit logs."
        );

    }

}

// =====================================================
// CLEAR AUDIT FILTERS
// =====================================================

function clearAuditFilters() {

    const search =
        document.getElementById(
            "auditSearch"
        );

    const role =
        document.getElementById(
            "auditRoleFilter"
        );

    const module =
        document.getElementById(
            "auditModuleFilter"
        );

    const date =
        document.getElementById(
            "auditDateFilter"
        );


    if (search) {
        search.value = "";
    }

    if (role) {
        role.value = "";
    }

    if (module) {
        module.value = "";
    }

    if (date) {
        date.value = "";
    }


    renderAuditLogs();

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

// ADMIN ROLE
function isAdminUser() {

    return currentUserRole === "admin";
}


// VIEWER ROLE
function isViewerUser() {

    return currentUserRole === "viewer";
}


// ATTENDANCE ROLE
function isAttendanceUser() {

    return currentUserRole === "attendance";
}


// =====================================
// ATTENDANCE PERMISSION
// Admin + Attendance account
// =====================================

function canManageAttendance() {

    return (
        isAdminUser() ||
        isAttendanceUser()
    );
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

// =====================================================
// CHURCHHQ AUDIT LOGGER
// =====================================================

async function writeAuditLog(
    action,
    module,
    description = "",
    recordId = null,
    metadata = {}
) {

    try {

        if (!currentUser) {

            console.warn(
                "⚠️ Audit skipped: no authenticated user."
            );

            return false;
        }


        const { error } =
            await churchSupabase.rpc(
                "write_audit_log",
                {
                    p_action:
                        action,

                    p_module:
                        module,

                    p_record_id:
                        recordId !== null
                            ? String(recordId)
                            : null,

                    p_description:
                        description || null,

                    p_metadata:
                        metadata || {}
                }
            );


        if (error) {

            console.error(
                "❌ Audit log failed:",
                error
            );

            return false;
        }


        console.log(
            "📝 Audit log saved:",
            action,
            module
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Audit logger error:",
            error
        );

        return false;
    }

}

// =====================================
// MEMBER MANAGEMENT PERMISSION
// Admin + Attendance account
// =====================================

function canManageMembers() {

    return (
        isAdminUser() ||
        isAttendanceUser()
    );

}


function requireMemberManager() {

    if (!canManageMembers()) {

        alert(
            "You do not have permission to manage members."
        );

        return false;
    }

    return true;
}

// =====================================
// ROLE-BASED UI
// =====================================

function applyRoleBasedUI() {

    console.log(
        "🔐 Applying role-based UI:",
        currentUserRole
    );


    // =====================================
    // ADMIN-ONLY CONTROLS
    // =====================================

    const adminControls =
        document.querySelectorAll(
            '[data-admin-only="true"]'
        );


    adminControls.forEach(element => {

        if (isAdminUser()) {

            element.style.display = "";
            element.disabled = false;

        } else {

            element.style.display = "none";
            element.disabled = true;

        }

    });


    // =====================================
    // SERVICE PLANNER FORM PERMISSIONS
    //
    // Admin      = Editable
    // Attendance = View Only
    // Viewer     = No access
    // =====================================

    const servicePlannerFields =
        document.querySelectorAll(
            "#service-planner input, " +
            "#service-planner textarea, " +
            "#service-planner select"
        );


    servicePlannerFields.forEach(field => {

        if (isAdminUser()) {

            field.disabled = false;
            field.readOnly = false;

        } else {

            field.disabled = true;
            field.readOnly = true;

        }

    });


    // =====================================
    // ATTENDANCE MANAGEMENT CONTROLS
    // Admin + Attendance
    // =====================================

    const attendanceControls =
        document.querySelectorAll(
            '[data-attendance-manage="true"]'
        );


    attendanceControls.forEach(element => {

        if (canManageAttendance()) {

            element.style.display = "";
            element.disabled = false;

        } else {

            element.style.display = "none";
            element.disabled = true;

        }

    });



    // =====================================
    // MEMBER MANAGEMENT CONTROLS
    // Admin + Attendance
    // =====================================

    const memberControls =
        document.querySelectorAll(
            '[data-member-manage="true"]'
        );


    memberControls.forEach(element => {

        if (canManageMembers()) {

            element.style.display = "";
            element.disabled = false;

        } else {

            element.style.display = "none";
            element.disabled = true;

        }

    });


    // =====================================
    // VIEWER SIDEBAR RESTRICTIONS
    // =====================================

const viewerRestrictedPages = [

    "service-planner",
    "program-planner",

    "members",
    "leaders",
    "attendance",
    "reports",
    "settings"

];


    viewerRestrictedPages.forEach(pageId => {

        const navItem =
            document.querySelector(
                `.nav-item[onclick*="showPage('${pageId}')"]`
            );


        if (!navItem) {
            return;
        }


        if (isViewerUser()) {

            navItem.style.setProperty(
                "display",
                "none",
                "important"
            );

        } else {

            navItem.style.removeProperty(
                "display"
            );

        }

    });


    // =====================================
    // ROLE LOG
    // =====================================

    if (isAdminUser()) {

        console.log(
            "👑 Admin UI enabled"
        );

    } else if (isAttendanceUser()) {

        console.log(
            "📋 Attendance UI enabled"
        );

    } else if (isViewerUser()) {

        console.log(
            "👁️ Viewer UI enabled"
        );

    }

}


// =====================================
// SHOW CHURCH APP
// =====================================

function showChurchApp() {

    const login =
        document.getElementById(
            "loginScreen"
        );


    const app =
        document.getElementById(
            "churchApp"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (app) {

        app.style.display =
            "block";

    }


    console.log(
        "✅ ChurchHQ App unlocked"
    );

}


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


    // =====================================
    // AUDIT - LOGOUT
    // Must run BEFORE signOut
    // =====================================

    await writeAuditLog(
        "LOGOUT",
        "Authentication",
        `${currentUserRole || "Unknown"} account logged out.`
    );


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


// =====================================================
// CHURCHHQ EDITOR ENGINE - PHASE 1
// =====================================================

let currentChurchEditorTab = "lyrics";


// =====================================================
// SWITCH EDITOR TAB
// =====================================================

function switchChurchEditorTab(type) {

    currentChurchEditorTab = type;


    const panels = {
        lyrics:
            document.getElementById(
                "editorPanelLyrics"
            ),

        sermon:
            document.getElementById(
                "editorPanelSermon"
            ),

        bible:
            document.getElementById(
                "editorPanelBible"
            )
    };


    const tabs = {
        lyrics:
            document.getElementById(
                "editorTabLyrics"
            ),

        sermon:
            document.getElementById(
                "editorTabSermon"
            ),

        bible:
            document.getElementById(
                "editorTabBible"
            )
    };


    Object.keys(panels).forEach(key => {

        if (panels[key]) {

            panels[key].classList.toggle(
                "hidden",
                key !== type
            );

        }


        if (tabs[key]) {

            tabs[key].classList.toggle(
                "active",
                key === type
            );

        }

    });

}


// =====================================================
// INSERT TAG AT CURRENT CURSOR POSITION
// =====================================================

function insertEditorTag(
    textareaId,
    tag
) {

    const textarea =
        document.getElementById(
            textareaId
        );


    if (!textarea) {
        return;
    }


    textarea.focus();


    const start =
        textarea.selectionStart ?? 0;

    const end =
        textarea.selectionEnd ?? start;


    const currentText =
        textarea.value || "";


    // Text inserted at the exact cursor position
    const tagText =
        `[${tag}]`;


    textarea.value =
        currentText.substring(
            0,
            start
        ) +

        tagText +

        currentText.substring(
            end
        );


    const newCursorPosition =
        start +
        tagText.length;


    textarea.setSelectionRange(
        newCursorPosition,
        newCursorPosition
    );


    // Trigger input event for future autosave
    textarea.dispatchEvent(
        new Event(
            "input",
            {
                bubbles: true
            }
        )
    );

}


// =====================================================
// INTERNAL REFERENCE PLACEHOLDER
//
// Google/Bible real browser integration comes next.
// Text in editors is NOT deleted when this opens.
// =====================================================

// =====================================================
// EDITOR INTERNAL GOOGLE / BIBLE VIEWER
// =====================================================

// Ilalagay natin dito ang Bible website mo later.
const EDITOR_BIBLE_URL =
    "https://www.biblegateway.com/passage/?search=Genesis%201&version=KJV";

function openEditorReference(
    panelKey,
    type
) {

    const editor =
        document.getElementById(
            panelKey + "Editor"
        );

    const reference =
        document.getElementById(
            panelKey + "Reference"
        );

    const title =
        document.getElementById(
            panelKey + "ReferenceTitle"
        );

    const content =
        document.getElementById(
            panelKey + "ReferenceContent"
        );


    if (
        !editor ||
        !reference ||
        !content
    ) {
        return;
    }


    // =====================================
    // HIDE TEXT EDITOR
    // Text itself is NOT cleared.
    // =====================================

    editor.classList.add(
        "hidden"
    );


    // =====================================
    // SHOW INTERNAL VIEWER
    // =====================================

    reference.classList.remove(
        "hidden"
    );


    // =====================================
    // GOOGLE
    // =====================================

    if (type === "google") {

        if (title) {

            title.textContent =
                "Google Search";

        }


        // Huwag ulitin ang UI kung Google
        // viewer na ang naka-open.
        if (
            content.dataset.referenceType ===
            "google" &&
            content.innerHTML.trim()
        ) {
            return;
        }


        content.dataset.referenceType =
            "google";



content.innerHTML = `

    <div class="editor-google-view">

        <div class="editor-google-mode-header">

            <span
                id="${panelKey}GoogleModeLabel"
                class="editor-google-mode-label"
            >
                🔎 Google Search
            </span>


            <button
                type="button"
                class="editor-google-back-btn"
                onclick="backToEditorGoogleResults('${panelKey}')"
                title="Return to Google search results"
            >
                ← Back to Results
            </button>

        </div>


        <div class="editor-google-searchbar">

            <input
                type="text"
                id="${panelKey}GoogleInput"
                placeholder="Enter song title, artist, lyrics or chords..."
                autocomplete="off"
            >

            <button
                type="button"
                onclick="searchEditorGoogle('${panelKey}')"
            >
                Search
            </button>

        </div>


        <div class="editor-google-quick-search">

            <button
                type="button"
                onclick="searchEditorGoogle('${panelKey}', 'lyrics')"
            >
                🎵 Lyrics
            </button>


            <button
                type="button"
                onclick="searchEditorGoogle('${panelKey}', 'chords')"
            >
                🎸 Chords
            </button>

        </div>


        <div class="editor-browser-frame-wrap">

            <div
                id="${panelKey}GoogleStart"
                class="editor-browser-start"
            >

                <div class="editor-browser-logo">
                    G
                </div>

                <h3>
                    Song Reference Search
                </h3>

                <p>
                    Search lyrics, chords,
                    worship songs and other references.
                </p>

            </div>


            <iframe
                id="${panelKey}GoogleFrame"
                class="editor-browser-frame hidden"
                title="Google Search"
                referrerpolicy="no-referrer"
            ></iframe>

        </div>

    </div>

`;

        


        const searchInput =
            document.getElementById(
                panelKey +
                "GoogleInput"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        searchEditorGoogle(
                            panelKey
                        );

                    }

                }
            );


            setTimeout(
                () => {
                    searchInput.focus();
                },
                50
            );

        }


        return;
    }


// =====================================
// ULTIMATE GUITAR
// =====================================

if (type === "ultimate") {

    if (title) {
        title.textContent =
            "Ultimate Guitar";
    }


    // Preserve session kapag Hide lang
    if (
        content.dataset.referenceType ===
        "ultimate" &&
        content.querySelector("iframe")
    ) {
        return;
    }


    content.dataset.referenceType =
        "ultimate";


    content.innerHTML = `

        <iframe
            class="editor-browser-frame"
            src="https://ultimate-guitar.com"
            title="Ultimate Guitar"
            frameborder="0"
            allowfullscreen
        ></iframe>

    `;


    return;
}

    // =====================================
    // BIBLE
    // =====================================



    if (type === "bible") {

        if (title) {

            title.textContent =
                "Bible";

        }


        if (
            !EDITOR_BIBLE_URL
        ) {

            content.dataset.referenceType =
                "bible";


            content.innerHTML = `

                <div class="editor-browser-placeholder">

                    <div
                        style="
                            font-size:42px;
                            margin-bottom:12px;
                        "
                    >
                        📖
                    </div>

                    <h3>
                        Bible Viewer
                    </h3>

                    <p>
                        Bible website is ready to be connected.
                    </p>

                    <p
                        style="
                            margin-top:8px;
                            font-size:12px;
                        "
                    >
                        Send me the Bible website link
                        and we will place it here.
                    </p>

                </div>

            `;


            return;
        }


        // Preserve existing Bible iframe/session
        if (
            content.dataset.referenceType ===
            "bible" &&
            content.querySelector(
                "iframe"
            )
        ) {
            return;
        }


        content.dataset.referenceType =
            "bible";


        content.innerHTML = `

            <iframe
                class="editor-browser-frame"
                src="${EDITOR_BIBLE_URL}"
                title="Bible"
                referrerpolicy="no-referrer"
            ></iframe>

        `;

    }

}

// =====================================================
// GOOGLE SEARCH - LYRICS / CHORDS MODE
// =====================================================

const editorGoogleSearchState = {};


function searchEditorGoogle(
    panelKey,
    mode = ""
) {

    const input =
        document.getElementById(
            panelKey + "GoogleInput"
        );

    const frame =
        document.getElementById(
            panelKey + "GoogleFrame"
        );

    const startScreen =
        document.getElementById(
            panelKey + "GoogleStart"
        );


    if (
        !input ||
        !frame
    ) {
        return;
    }


    let query =
        String(
            input.value || ""
        ).trim();


    if (!query) {

        input.focus();

        return;

    }


    // =====================================
    // AUTOMATIC SEARCH TYPE
    // =====================================

    if (mode === "lyrics") {

        if (
            !query
                .toLowerCase()
                .includes("lyrics")
        ) {

            query += " lyrics";

        }

    }


    if (mode === "chords") {

        if (
            !query
                .toLowerCase()
                .includes("chords")
        ) {

            query += " chords";

        }

    }


    // =====================================
    // GOOGLE SEARCH URL
    // =====================================

    const searchUrl =
        "https://www.google.com/search?igu=1&q=" +
        encodeURIComponent(query);


    // Save current search
    editorGoogleSearchState[panelKey] = {

        query:
            input.value.trim(),

        searchUrl,

        mode

    };


    if (startScreen) {

        startScreen.classList.add(
            "hidden"
        );

    }


    frame.classList.remove(
        "hidden"
    );


    frame.src =
        searchUrl;


    updateEditorGoogleModeLabel(
        panelKey,
        mode
    );

}

// =====================================================
// BACK TO GOOGLE RESULTS
// =====================================================

function backToEditorGoogleResults(
    panelKey
) {

    const frame =
        document.getElementById(
            panelKey + "GoogleFrame"
        );


    const state =
        editorGoogleSearchState[
            panelKey
        ];


    if (
        !frame ||
        !state ||
        !state.searchUrl
    ) {

        return;

    }


    frame.src =
        state.searchUrl;

}

// =====================================================
// GOOGLE SEARCH MODE LABEL
// =====================================================

function updateEditorGoogleModeLabel(
    panelKey,
    mode
) {

    const label =
        document.getElementById(
            panelKey +
            "GoogleModeLabel"
        );


    if (!label) {
        return;
    }


    if (mode === "lyrics") {

        label.textContent =
            "🎵 Lyrics Search";

        return;

    }


    if (mode === "chords") {

        label.textContent =
            "🎸 Chords Search";

        return;

    }


    label.textContent =
        "🔎 Google Search";

}

// =====================================================
// HIDE INTERNAL VIEWER
//
// Browser session remains loaded.
// Editor text remains untouched.
// =====================================================

function hideEditorReference(
    panelKey
) {

    const editor =
        document.getElementById(
            panelKey + "Editor"
        );

    const reference =
        document.getElementById(
            panelKey + "Reference"
        );


    if (reference) {

        reference.classList.add(
            "hidden"
        );

    }


    if (editor) {

        editor.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// CLOSE INTERNAL VIEWER
//
// Browser session is destroyed.
// Editor text remains untouched.
// =====================================================

function closeEditorReference(
    panelKey
) {

    const editor =
        document.getElementById(
            panelKey + "Editor"
        );

    const reference =
        document.getElementById(
            panelKey + "Reference"
        );

    const content =
        document.getElementById(
            panelKey + "ReferenceContent"
        );


    if (reference) {

        reference.classList.add(
            "hidden"
        );

    }


    if (editor) {

        editor.classList.remove(
            "hidden"
        );

    }


    if (content) {

        // Removes iframe/browser session
        content.innerHTML =
            "";

        delete content.dataset
            .referenceType;

    }

}


// =====================================================
// CHURCHHQ EDITOR ENGINE
// PHASE 2 - DYNAMIC TAGS
// =====================================================


// =====================================
// DEFAULT TAG COLLECTIONS
// =====================================

const churchEditorDefaultTags = {

    lyrics: [
        "V1",
        "V2",
        "V3",
        "V4",
        "V5",
        "PC",
        "C1",
        "C2",
        "C3",
        "C4",
        "I",
        "A",
        "B",
        "O",
        "T",
        "1",
        "2"
    ],

    sermon: [
        "INTRO",
        "P1",
        "P2",
        "P3",
        "ILL",
        "APP",
        "CONCLUSION"
    ],

    bible: [
        "V1",
        "V2",
        "V3",
        "V4",
        "REF",
        "READER"
    ]

};


// =====================================
// CURRENT TAG DATA
// =====================================

let churchEditorTags = {
    lyrics: [],
    sermon: [],
    bible: []
};


let currentEditorTagManagerType =
    "lyrics";


// =====================================
// LOAD TAGS
// =====================================

async function loadChurchEditorTags() {

    try {

        const { data, error } =
            await churchSupabase
                .from("editor_tags")
                .select(
                    "id, tag_type, tag_name, sort_order"
                )
                .order(
                    "sort_order",
                    { ascending: true }
                );


        if (error) {

            console.error(
                "❌ Failed to load editor tags:",
                error
            );

            loadDefaultEditorTagsLocally();

            return;
        }


        // =====================================
        // EMPTY TABLE
        // =====================================

        if (!data || data.length === 0) {

            console.log(
                "ℹ️ No editor tags found in Supabase."
            );


            // Load defaults into UI first
            loadDefaultEditorTagsLocally();


            // Admin can create initial Supabase records
            if (isAdminUser()) {

                await seedDefaultEditorTagsToSupabase();

            }

            return;
        }


        // =====================================
        // RESET CURRENT DATA
        // =====================================

        churchEditorTags = {
            lyrics: [],
            sermon: [],
            bible: []
        };


        // =====================================
        // BUILD TAG ARRAYS
        // =====================================

        data.forEach(row => {

            if (
                churchEditorTags[row.tag_type]
            ) {

                churchEditorTags[
                    row.tag_type
                ].push(
                    row.tag_name
                );

            }

        });


        renderAllChurchEditorTagToolbars();


        console.log(
            "✅ Editor tags loaded from Supabase:",
            churchEditorTags
        );


    } catch (error) {

        console.error(
            "❌ Editor tag load error:",
            error
        );

        loadDefaultEditorTagsLocally();

    }

}

function loadDefaultEditorTagsLocally() {

    churchEditorTags = {

        lyrics: [
            ...churchEditorDefaultTags.lyrics
        ],

        sermon: [
            ...churchEditorDefaultTags.sermon
        ],

        bible: [
            ...churchEditorDefaultTags.bible
        ]

    };


    renderAllChurchEditorTagToolbars();

}

async function seedDefaultEditorTagsToSupabase() {

    if (!isAdminUser()) {
        return false;
    }


    const rows = [];


    Object.keys(
        churchEditorDefaultTags
    ).forEach(type => {

        churchEditorDefaultTags[type]
            .forEach(
                (tag, index) => {

                    rows.push({
                        tag_type: type,
                        tag_name: tag,
                        sort_order: index
                    });

                }
            );

    });


    try {

        const { error } =
            await churchSupabase
                .from("editor_tags")
                .insert(rows);


        if (error) {

            console.error(
                "❌ Failed to seed editor tags:",
                error
            );

            return false;
        }


        console.log(
            "✅ Default editor tags saved to Supabase."
        );


        await loadChurchEditorTags();

        return true;


    } catch (error) {

        console.error(
            "❌ Editor tag seed error:",
            error
        );

        return false;

    }

}

// =====================================
// SAVE TAGS
// =====================================

async function saveChurchEditorTags() {

    if (!isAdminUser()) {

        console.warn(
            "🚫 Admin permission required to save editor tags."
        );

        return false;

    }


    const rows = [];


    Object.keys(
        churchEditorTags
    ).forEach(type => {

        churchEditorTags[type]
            .forEach(
                (tag, index) => {

                    rows.push({
                        tag_type: type,
                        tag_name: tag,
                        sort_order: index
                    });

                }
            );

    });


    try {

        // =====================================
        // DELETE OLD TAGS
        // =====================================

        const { error: deleteError } =
            await churchSupabase
                .from("editor_tags")
                .delete()
                .neq("id", 0);


        if (deleteError) {

            console.error(
                "❌ Failed to clear editor tags:",
                deleteError
            );

            return false;
        }


        // =====================================
        // INSERT NEW TAG ORDER
        // =====================================

        if (rows.length > 0) {

            const { error: insertError } =
                await churchSupabase
                    .from("editor_tags")
                    .insert(rows);


            if (insertError) {

                console.error(
                    "❌ Failed to save editor tags:",
                    insertError
                );

                return false;
            }

        }


        console.log(
            "✅ Editor tags saved to Supabase."
        );

        return true;


    } catch (error) {

        console.error(
            "❌ Editor tag save error:",
            error
        );

        return false;

    }

}

// =====================================
// RENDER ALL TOOLBARS
// =====================================

function renderAllChurchEditorTagToolbars() {

    document
        .querySelectorAll(
            "[data-editor-tags]"
        )
        .forEach(toolbar => {

            renderChurchEditorTagToolbar(
                toolbar
            );

        });

}


// =====================================
// RENDER ONE TOOLBAR
// =====================================

function renderChurchEditorTagToolbar(
    toolbar
) {

    if (!toolbar) {
        return;
    }


    const type =
        toolbar.dataset.editorTags;


    const targetTextareaId =
        toolbar.dataset.target;


    if (
        !type ||
        !targetTextareaId
    ) {
        return;
    }


    const tags =
        Array.isArray(
            churchEditorTags[type]
        )
            ? churchEditorTags[type]
            : [];


    toolbar.innerHTML =
        "";


    // =====================================
    // TAG BUTTONS
    // =====================================

    tags.forEach(tag => {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            tag;


        button.title =
            `Insert [${tag}]`;


        button.addEventListener(
            "click",
            () => {

                insertEditorTag(
                    targetTextareaId,
                    tag
                );

            }
        );


        toolbar.appendChild(
            button
        );

    });


    // =====================================
    // MANAGE BUTTON
    // =====================================

    const manageButton =
        document.createElement(
            "button"
        );


    manageButton.type =
        "button";


    manageButton.className =
        "editor-tag-manage-btn";

    manageButton.setAttribute(
        "data-admin-only",
        "true"
    );

    manageButton.textContent =
        "⚙ Manage";


    manageButton.addEventListener(
        "click",
        () => {

            openEditorTagManager(
                type
            );

        }
    );


if (!isAdminUser()) {

    manageButton.style.display =
        "none";

    manageButton.disabled =
        true;

}

    toolbar.appendChild(
        manageButton
    );

}


// =====================================
// OPEN TAG MANAGER
// =====================================

function openEditorTagManager(
    type
) {
    if (!isAdminUser()) {

    console.warn(
        "🚫 Admin permission required to manage editor tags."
    );

    return;

}

    if (
        !churchEditorTags[type]
    ) {
        return;
    }


    currentEditorTagManagerType =
        type;


    const modal =
        document.getElementById(
            "editorTagManagerModal"
        );


    const title =
        document.getElementById(
            "editorTagManagerTitle"
        );


    const input =
        document.getElementById(
            "newEditorTagInput"
        );


    const names = {

        lyrics:
            "Lyrics & Chords Tags",

        sermon:
            "Sermon Editor Tags",

        bible:
            "Bible Reading Tags"

    };


    if (title) {

        title.textContent =
            names[type] ||
            "Manage Editor Tags";

    }


    if (input) {

        input.value =
            "";

    }


    renderEditorTagManagerList();


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }


    setTimeout(
        () => {

            if (input) {
                input.focus();
            }

        },
        50
    );

}


// =====================================
// CLOSE TAG MANAGER
// =====================================

function closeEditorTagManager() {

    const modal =
        document.getElementById(
            "editorTagManagerModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


// =====================================
// ADD TAG
// =====================================

async function addEditorTag() {

    if (!isAdminUser()) {

        alert(
            "Only Admin can manage editor tags."
        );

        return;
    }


    const input =
        document.getElementById(
            "newEditorTagInput"
        );


    if (!input) {
        return;
    }


    let value =
        String(
            input.value || ""
        )
            .trim()
            .replace(/^\[/, "")
            .replace(/\]$/, "")
            .trim();


    if (!value) {

        alert(
            "Please enter a tag name."
        );

        input.focus();

        return;
    }


    const type =
        currentEditorTagManagerType;


    const duplicate =
        churchEditorTags[type]
            .some(tag =>
                String(tag)
                    .toLowerCase() ===
                value.toLowerCase()
            );


    if (duplicate) {

        alert(
            "That tag already exists."
        );

        return;
    }


    // Backup current state
    const oldTags = [
        ...churchEditorTags[type]
    ];


    churchEditorTags[type].push(
        value
    );


    renderAllChurchEditorTagToolbars();
    renderEditorTagManagerList();


    const saved =
        await saveChurchEditorTags();


    if (!saved) {

        // Restore if Supabase save failed
        churchEditorTags[type] =
            oldTags;

        renderAllChurchEditorTagToolbars();
        renderEditorTagManagerList();

        alert(
            "Failed to save the new tag."
        );

        return;
    }


    input.value = "";
    input.focus();

}


// =====================================
// RENDER MANAGER LIST
// =====================================

function renderEditorTagManagerList() {

    const container =
        document.getElementById(
            "editorTagManagerList"
        );


    if (!container) {
        return;
    }


    const type =
        currentEditorTagManagerType;


    const tags =
        churchEditorTags[type] || [];


    container.innerHTML =
        "";


    if (tags.length === 0) {

        container.innerHTML = `
            <div class="editor-tag-manager-empty">
                No tags yet.
                Use "+ Add Tag" above.
            </div>
        `;

        return;
    }


    tags.forEach(
        (tag, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "editor-tag-manager-row";


            const nameArea =
                document.createElement(
                    "div"
                );


            nameArea.className =
                "editor-tag-manager-name";


            const preview =
                document.createElement(
                    "span"
                );


            preview.className =
                "editor-tag-preview";


            preview.textContent =
                `[${tag}]`;


            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                tag;


            nameArea.appendChild(
                preview
            );


            nameArea.appendChild(
                label
            );


            // =====================================
            // ACTIONS
            // =====================================

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "editor-tag-manager-actions";


            // MOVE UP

            const upButton =
                document.createElement(
                    "button"
                );


            upButton.type =
                "button";

            upButton.textContent =
                "↑";

            upButton.title =
                "Move Up";

            upButton.disabled =
                index === 0;


            upButton.addEventListener(
                "click",
                () => {

                    moveEditorTag(
                        type,
                        index,
                        -1
                    );

                }
            );


            // MOVE DOWN

            const downButton =
                document.createElement(
                    "button"
                );


            downButton.type =
                "button";

            downButton.textContent =
                "↓";

            downButton.title =
                "Move Down";

            downButton.disabled =
                index ===
                tags.length - 1;


            downButton.addEventListener(
                "click",
                () => {

                    moveEditorTag(
                        type,
                        index,
                        1
                    );

                }
            );


            // EDIT

            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";

            editButton.textContent =
                "✏";

            editButton.title =
                "Rename";


            editButton.addEventListener(
                "click",
                () => {

                    editEditorTag(
                        type,
                        index
                    );

                }
            );


            // DELETE

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";

            deleteButton.textContent =
                "×";

            deleteButton.title =
                "Delete";

            deleteButton.className =
                "editor-tag-delete-btn";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteEditorTag(
                        type,
                        index
                    );

                }
            );


            actions.append(
                upButton,
                downButton,
                editButton,
                deleteButton
            );


            row.append(
                nameArea,
                actions
            );


            container.appendChild(
                row
            );

        }
    );

}


// =====================================
// EDIT / RENAME TAG
// =====================================

async function editEditorTag(
    type,
    index
) {

    if (!isAdminUser()) {

        alert(
            "Only Admin can manage editor tags."
        );

        return;
    }


    const current =
        churchEditorTags[type][index];


    let newValue =
        prompt(
            "Rename tag:",
            current
        );


    if (newValue === null) {
        return;
    }


    newValue =
        String(newValue)
            .trim()
            .replace(/^\[/, "")
            .replace(/\]$/, "")
            .trim();


    if (!newValue) {

        alert(
            "Tag name cannot be empty."
        );

        return;
    }


    const duplicate =
        churchEditorTags[type]
            .some(
                (tag, tagIndex) =>
                    tagIndex !== index &&
                    String(tag)
                        .toLowerCase() ===
                    newValue.toLowerCase()
            );


    if (duplicate) {

        alert(
            "That tag already exists."
        );

        return;
    }


    const oldValue =
        churchEditorTags[type][index];


    churchEditorTags[type][index] =
        newValue;


    renderAllChurchEditorTagToolbars();
    renderEditorTagManagerList();


    const saved =
        await saveChurchEditorTags();


    if (!saved) {

        churchEditorTags[type][index] =
            oldValue;

        renderAllChurchEditorTagToolbars();
        renderEditorTagManagerList();

        alert(
            "Failed to rename the tag."
        );

    }

}

// =====================================
// DELETE TAG
// =====================================

async function deleteEditorTag(
    type,
    index
) {

    if (!isAdminUser()) {

        alert(
            "Only Admin can manage editor tags."
        );

        return;
    }


    const tag =
        churchEditorTags[type][index];


    const confirmed =
        confirm(
            `Delete tag [${tag}]?`
        );


    if (!confirmed) {
        return;
    }


    const oldTags = [
        ...churchEditorTags[type]
    ];


    churchEditorTags[type]
        .splice(
            index,
            1
        );


    renderAllChurchEditorTagToolbars();
    renderEditorTagManagerList();


    const saved =
        await saveChurchEditorTags();


    if (!saved) {

        churchEditorTags[type] =
            oldTags;

        renderAllChurchEditorTagToolbars();
        renderEditorTagManagerList();

        alert(
            "Failed to delete the tag."
        );

    }

}

// =====================================
// MOVE TAG
// =====================================

async function moveEditorTag(
    type,
    index,
    direction
) {

    if (!isAdminUser()) {
        return;
    }


    const tags =
        churchEditorTags[type];


    const newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >= tags.length
    ) {
        return;
    }


    const oldTags = [
        ...tags
    ];


    const temp =
        tags[index];

    tags[index] =
        tags[newIndex];

    tags[newIndex] =
        temp;


    renderAllChurchEditorTagToolbars();
    renderEditorTagManagerList();


    const saved =
        await saveChurchEditorTags();


    if (!saved) {

        churchEditorTags[type] =
            oldTags;

        renderAllChurchEditorTagToolbars();
        renderEditorTagManagerList();

    }

}


// =====================================
// RESET CURRENT TAG TYPE
// =====================================

async function resetEditorTagsToDefault() {

    if (!isAdminUser()) {

        alert(
            "Only Admin can manage editor tags."
        );

        return;
    }


    const type =
        currentEditorTagManagerType;


    const confirmed =
        confirm(
            "Reset this editor's tags to the default list?"
        );


    if (!confirmed) {
        return;
    }


    const oldTags = [
        ...churchEditorTags[type]
    ];


    churchEditorTags[type] = [
        ...churchEditorDefaultTags[type]
    ];


    renderAllChurchEditorTagToolbars();
    renderEditorTagManagerList();


    const saved =
        await saveChurchEditorTags();


    if (!saved) {

        churchEditorTags[type] =
            oldTags;

        renderAllChurchEditorTagToolbars();
        renderEditorTagManagerList();

        alert(
            "Failed to reset editor tags."
        );

    }

}

// =====================================
// ENTER KEY = ADD TAG
// =====================================

const newEditorTagInput =
    document.getElementById(
        "newEditorTagInput"
    );


if (newEditorTagInput) {

    newEditorTagInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                addEditorTag();

            }

        }
    );

}


// =====================================
// INITIALIZE EDITOR TAGS
// =====================================

loadChurchEditorTags();
