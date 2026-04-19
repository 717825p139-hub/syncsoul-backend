// admin.js
var ADMIN_API = "/api";
var allUsers = [];
var deleteTargetId = null;
var currentUser = sessionStorage.getItem("loggedInUser");
var isAdmin = sessionStorage.getItem("isAdmin");

if (!currentUser || isAdmin !== "true") {
    alert("Access denied! Admins only.");
    window.location.href = "login.html";
}

var adminWelcome = document.getElementById("adminWelcome");
if (adminWelcome) adminWelcome.textContent = "Admin: " + currentUser;

function calculateAge(dob) {
    if (!dob) return "N/A";
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function sanitize(str) {
    if (!str) return "";
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function genderBadge(g) {
    if (!g) return '<span class="badge-other">N/A</span>';
    var gl = g.toLowerCase();
    if (gl === "male") return '<span class="badge-male">Male</span>';
    if (gl === "female") return '<span class="badge-female">Female</span>';
    return '<span class="badge-other">' + sanitize(g) + '</span>';
}

function updateStats(users) {
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalMale").textContent = users.filter(function(u){ return u.gender && u.gender.toLowerCase() === "male"; }).length;
    document.getElementById("totalFemale").textContent = users.filter(function(u){ return u.gender && u.gender.toLowerCase() === "female"; }).length;
    document.getElementById("totalOther").textContent = users.filter(function(u){ return !u.gender || (u.gender.toLowerCase() !== "male" && u.gender.toLowerCase() !== "female"); }).length;
}

function filterUsers() {
    var search = document.getElementById("searchInput").value.toLowerCase();
    var gender = document.getElementById("genderFilter").value.toLowerCase();
    var sort = document.getElementById("sortBy").value;

    var filtered = allUsers.filter(function(u) {
        var ms = !search ||
            (u.username && u.username.toLowerCase().includes(search)) ||
            (u.email && u.email.toLowerCase().includes(search)) ||
            (u.fname && u.fname.toLowerCase().includes(search)) ||
            (u.mname && u.mname.toLowerCase().includes(search));
        var mg = !gender || (u.gender && u.gender.toLowerCase() === gender);
        return ms && mg;
    });

    if (sort === "newest") filtered.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
    if (sort === "oldest") filtered.sort(function(a,b){ return new Date(a.createdAt) - new Date(b.createdAt); });
    if (sort === "name") filtered.sort(function(a,b){ return a.username.localeCompare(b.username); });

    renderTable(filtered);
}

function renderTable(users) {
    var tbody = document.getElementById("userTableBody");
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="no-data">No users found.</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(function(u) {
        var age = calculateAge(u.dob);
        var joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A";
        return '<tr>' +
            '<td><img class="avatar" id="av-' + u._id + '" src="https://via.placeholder.com/38?text=..."></td>' +
            '<td>' + sanitize(u.username) + '</td>' +
            '<td>' + sanitize((u.fname || "") + " " + (u.mname || "")) + '</td>' +
            '<td>' + sanitize(u.email) + '</td>' +
            '<td>' + sanitize(u.phone) + '</td>' +
            '<td>' + genderBadge(u.gender) + '</td>' +
            '<td>' + age + '</td>' +
            '<td>' + (u.salary ? "&#8377;" + sanitize(u.salary) : "N/A") + '</td>' +
            '<td>' + joined + '</td>' +
            '<td>' +
                '<button class="btn-view" onclick="viewUser(\'' + u._id + '\')"><i class="bi bi-eye"></i> View</button>' +
                '<button class="btn-delete" onclick="askDelete(\'' + u._id + '\',\'' + sanitize(u.username) + '\')"><i class="bi bi-trash"></i> Del</button>' +
            '</td>' +
            '</tr>';
    }).join('');

    users.forEach(function(u, i) {
        setTimeout(function() {
            fetch(ADMIN_API + "/photo/" + u._id)
                .then(function(r){ return r.json(); })
                .then(function(d){
                    var av = document.getElementById("av-" + u._id);
                    if (av && d.photo && d.photo.startsWith("data:image")) av.src = d.photo;
                }).catch(function(){});
        }, i * 200);
    });
}

function viewUser(id) {
    var u = allUsers.find(function(x){ return x._id === id; });
    if (!u) return;
    document.getElementById("modalName").textContent = (u.fname || "") + " " + (u.username || "");
    document.getElementById("modalPhoto").src = "https://via.placeholder.com/90?text=...";
    fetch(ADMIN_API + "/photo/" + id)
        .then(function(r){ return r.json(); })
        .then(function(d){
            document.getElementById("modalPhoto").src = (d.photo && d.photo.startsWith("data:image")) ? d.photo : "https://via.placeholder.com/90?text=No";
        }).catch(function(){});

    var details = [
        ["Username", u.username], ["Email", u.email], ["Phone", u.phone],
        ["Gender", u.gender || "N/A"], ["Age", calculateAge(u.dob)], ["DOB", u.dob || "N/A"],
        ["Father", u.fname || "N/A"], ["Mother", u.mname || "N/A"],
        ["Caste", u.cast || "N/A"], ["Salary", u.salary ? "₹" + u.salary : "N/A"],
        ["Bio", u.bio || "N/A"], ["Joined", u.createdAt ? new Date(u.createdAt).toLocaleString() : "N/A"]
    ];
    document.getElementById("modalDetails").innerHTML = details.map(function(d){
        return '<div class="detail-row"><span class="detail-label">' + d[0] + '</span><span>' + sanitize(String(d[1])) + '</span></div>';
    }).join('');
    document.getElementById("viewModal").classList.add("active");
}

function closeModal() { document.getElementById("viewModal").classList.remove("active"); }

function askDelete(id, username) {
    deleteTargetId = id;
    document.getElementById("confirmMsg").textContent = 'Delete "' + username + '"? This cannot be undone.';
    document.getElementById("confirmOverlay").classList.add("active");
}

function closeConfirm() {
    document.getElementById("confirmOverlay").classList.remove("active");
    deleteTargetId = null;
}

function confirmDelete() {
    if (!deleteTargetId) return;
    fetch(ADMIN_API + "/admin/delete/" + deleteTargetId, {
        method: "DELETE",
        headers: { "x-admin-user": currentUser }
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
        if (d.error) { alert(d.error); return; }
        allUsers = allUsers.filter(function(u){ return u._id !== deleteTargetId; });
        updateStats(allUsers);
        filterUsers();
        closeConfirm();
        alert("User deleted!");
    }).catch(function(){ alert("Error deleting user."); });
}

// Load users
fetch(ADMIN_API + "/admin/users", { headers: { "x-admin-user": currentUser } })
    .then(function(r){ return r.json(); })
    .then(function(users){
        allUsers = users;
        updateStats(users);
        filterUsers();
    })
    .catch(function(){
        document.getElementById("userTableBody").innerHTML =
            '<tr><td colspan="10" class="no-data">Could not load users.</td></tr>';
    });