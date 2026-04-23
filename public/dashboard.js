const API_BASE = window.location.origin.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3001';

const state = {
    currentUser: null,
    equipment: [],
    requests: [],
    returns: [],
    pendingRequests: [],
    pendingReturns: [],
    users: [],
    report: null,
};

const roleLabels = {
    STUDENT: 'Student',
    STAFF: 'Staff',
    ADMIN: 'Administrator',
};

document.addEventListener('DOMContentLoaded', bootstrapDashboard);

async function bootstrapDashboard() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');

    if (!token || !storedUser) {
        logout();
        return;
    }

    state.currentUser = JSON.parse(storedUser);

    setupNavigation();
    renderIdentity();
    configureRoleVisibility();
    await refreshDashboard();
}

function setupNavigation() {
    document.querySelectorAll('.nav-button').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.nav-button').forEach((item) => item.classList.remove('active'));
            document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`section-${button.dataset.section}`).classList.add('active');
        });
    });

    document.getElementById('equipment-form').addEventListener('submit', submitEquipmentForm);
    document.getElementById('equipment-search').addEventListener('input', renderEquipment);
    document.getElementById('equipment-filter-status').addEventListener('change', renderEquipment);
}

function renderIdentity() {
    const fullName = `${state.currentUser.firstName} ${state.currentUser.lastName}`;
    const roleText = roleLabels[state.currentUser.role] || state.currentUser.role;

    document.getElementById('sidebar-user-name').textContent = fullName;
    document.getElementById('sidebar-user-email').textContent = state.currentUser.email;
    document.getElementById('sidebar-user-role').textContent = roleText;
    document.getElementById('page-title').textContent = roleText === 'Administrator'
        ? 'Administrative Command Center'
        : `${roleText} Dashboard`;
    document.getElementById('page-subtitle').textContent = getSubtitleByRole(state.currentUser.role);
    document.getElementById('session-status').textContent = `${roleText} session active`;
    document.getElementById('sidebar-note').textContent = getSidebarNote(state.currentUser.role);
}

function configureRoleVisibility() {
    const isAdmin = state.currentUser.role === 'ADMIN';
    const canManage = isAdmin || state.currentUser.role === 'STAFF';

    document.getElementById('users-nav').classList.toggle('hidden', !isAdmin);
    document.getElementById('equipment-admin-panel').classList.toggle('hidden', !canManage);
    document.getElementById('pending-requests-panel').classList.toggle('hidden', !canManage);
    document.getElementById('pending-returns-panel').classList.toggle('hidden', !canManage);
    document.getElementById('section-users').classList.toggle('hidden', !isAdmin);
}

async function refreshDashboard() {
    showMessage('Loading dashboard data...', 'info');

    try {
        const requests = [
            apiRequest('/equipment'),
            apiRequest('/requests'),
            apiRequest('/returns'),
        ];

        if (state.currentUser.role === 'ADMIN' || state.currentUser.role === 'STAFF') {
            requests.push(apiRequest('/requests/pending'));
            requests.push(apiRequest('/returns/pending'));
        }

        if (state.currentUser.role === 'ADMIN') {
            requests.push(apiRequest('/admin/users'));
            requests.push(apiRequest('/admin/reports/overview'));
        }

        const data = await Promise.all(requests);
        let index = 0;

        state.equipment = data[index++] || [];
        state.requests = data[index++] || [];
        state.returns = data[index++] || [];
        state.pendingRequests = (state.currentUser.role === 'ADMIN' || state.currentUser.role === 'STAFF') ? data[index++] || [] : [];
        state.pendingReturns = (state.currentUser.role === 'ADMIN' || state.currentUser.role === 'STAFF') ? data[index++] || [] : [];
        state.users = state.currentUser.role === 'ADMIN' ? data[index++] || [] : [];
        state.report = state.currentUser.role === 'ADMIN' ? data[index++] || null : null;

        renderOverview();
        renderEquipment();
        renderMyRequests();
        renderPendingRequests();
        renderReturns();
        renderPendingReturns();
        renderUsers();
        hideMessage();
    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Failed to load dashboard data.', 'error');
    }
}

function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        logout();
        return Promise.reject(new Error('No session token found.'));
    }

    return fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    }).then(async (response) => {
        if (response.status === 401) {
            logout();
            throw new Error('Your session expired. Please log in again.');
        }

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            throw new Error(data?.message || 'Request failed.');
        }

        return data;
    });
}

function renderOverview() {
    const statsGrid = document.getElementById('stats-grid');
    const highlights = document.getElementById('overview-highlights');
    const activity = document.getElementById('overview-activity');

    const stats = getStatsForRole();
    statsGrid.innerHTML = stats.map((item) => `
        <div class="card">
            <h3>${item.label}</h3>
            <strong>${item.value}</strong>
            <small>${item.caption}</small>
        </div>
    `).join('');

    const lowStock = state.report?.lowStockItems || [];
    const highlightsData = state.currentUser.role === 'ADMIN'
        ? [
            { title: 'Role Balance', body: `${state.report.roleCounts.ADMIN} admin, ${state.report.roleCounts.STAFF} staff, ${state.report.roleCounts.STUDENT} students` },
            { title: 'Low Stock Watch', body: lowStock.length ? `${lowStock.length} equipment items need attention soon.` : 'No low-stock alerts right now.' },
            { title: 'Operational Pace', body: `${state.report.summary.pendingRequests} requests and ${state.report.summary.pendingReturns} returns are waiting on action.` },
            { title: 'Inventory Health', body: `${state.report.summary.totalAvailableUnits} available units across ${state.report.summary.totalEquipment} equipment records.` },
        ]
        : [
            { title: 'Borrowing Status', body: `${countByStatus(state.requests, 'APPROVED')} approved requests are currently active.` },
            { title: 'Pending Decisions', body: `${countByStatus(state.requests, 'PENDING')} requests are still awaiting review.` },
            { title: 'Returns Progress', body: `${state.returns.length} return records are currently attached to your account.` },
            { title: 'Catalog Reach', body: `${state.equipment.length} equipment items are visible in the system.` },
        ];

    highlights.innerHTML = highlightsData.map((item) => `
        <div class="activity-card">
            <h4>${item.title}</h4>
            <p>${item.body}</p>
        </div>
    `).join('');

    const activityItems = getActivityItems();
    activity.innerHTML = activityItems.length
        ? activityItems.map((item) => `<div class="list-line"><strong>${item.title}</strong><br>${item.body}</div>`).join('')
        : '<div class="empty-state">No recent activity to show yet.</div>';
}

function renderEquipment() {
    const search = document.getElementById('equipment-search').value.trim().toLowerCase();
    const statusFilter = document.getElementById('equipment-filter-status').value;
    const list = document.getElementById('equipment-list');
    const canManage = state.currentUser.role === 'ADMIN' || state.currentUser.role === 'STAFF';

    const filtered = state.equipment.filter((item) => {
        const matchesSearch = !search || [item.name, item.description, item.category, item.subcategory, item.location]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!filtered.length) {
        list.innerHTML = '<div class="empty-state">No equipment matches your current filters.</div>';
        return;
    }

    list.innerHTML = filtered.map((item) => {
        const lowStock = item.availableQuantity <= Math.max(1, Math.floor(item.totalQuantity * 0.25));
        const specText = item.specifications && Object.keys(item.specifications).length
            ? Object.entries(item.specifications).map(([key, value]) => `${key}: ${value}`).join(', ')
            : 'No specifications provided';

        return `
            <article class="equipment-card">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="meta-row">
                    <span class="badge">${item.category}</span>
                    <span class="badge ${item.status === 'AVAILABLE' ? 'good' : 'warn'}">${item.status}</span>
                    ${lowStock ? '<span class="badge danger">Low stock</span>' : ''}
                </div>
                <p><strong>Location:</strong> ${item.location || 'Main Campus'}</p>
                <p><strong>Available:</strong> ${item.availableQuantity} / ${item.totalQuantity}</p>
                <p><strong>Specs:</strong> ${specText}</p>
                <div class="button-row">
                    ${canBorrow(item) ? `<button class="primary-btn" type="button" onclick="borrowEquipment(${item.id})">Request Borrow</button>` : ''}
                    ${canManage ? `<button class="secondary-btn" type="button" onclick="populateEquipmentForm(${item.id})">Edit</button>` : ''}
                    ${state.currentUser.role === 'ADMIN' ? `<button class="danger-btn" type="button" onclick="deleteEquipment(${item.id})">Delete</button>` : ''}
                </div>
            </article>
        `;
    }).join('');
}

function renderMyRequests() {
    const container = document.getElementById('my-requests-table');
    if (!state.requests.length) {
        container.innerHTML = '<div class="empty-state">No requests yet.</div>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Equipment</th>
                    <th>Dates</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${state.requests.map((request) => `
                    <tr>
                        <td>${request.equipment?.name || 'Unknown equipment'}<br><small>${request.user?.email || ''}</small></td>
                        <td>${formatDate(request.startDate)} to ${formatDate(request.endDate)}</td>
                        <td>${request.requestedQuantity}</td>
                        <td><span class="badge ${badgeClassForStatus(request.status)}">${request.status}</span></td>
                        <td>${request.notes || request.rejectionReason || 'No notes'}</td>
                        <td>
                            <div class="inline-actions">
                                ${request.status === 'PENDING' ? `<button class="secondary-btn" type="button" onclick="cancelRequest(${request.id})">Cancel</button>` : ''}
                                ${canCreateReturn(request) ? `<button class="primary-btn" type="button" onclick="submitReturnForRequest(${request.id})">Return</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderPendingRequests() {
    const container = document.getElementById('pending-requests-table');
    if (!(state.currentUser.role === 'ADMIN' || state.currentUser.role === 'STAFF')) {
        container.innerHTML = '';
        return;
    }

    if (!state.pendingRequests.length) {
        container.innerHTML = '<div class="empty-state">No pending requests at the moment.</div>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Borrower</th>
                    <th>Equipment</th>
                    <th>Dates</th>
                    <th>Quantity</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${state.pendingRequests.map((request) => `
                    <tr>
                        <td>${request.user?.firstName || ''} ${request.user?.lastName || ''}<br><small>${request.user?.email || ''}</small></td>
                        <td>${request.equipment?.name || 'Unknown equipment'}</td>
                        <td>${formatDate(request.startDate)} to ${formatDate(request.endDate)}</td>
                        <td>${request.requestedQuantity}</td>
                        <td>${request.notes || 'No notes'}</td>
                        <td>
                            <div class="inline-actions">
                                <button class="primary-btn" type="button" onclick="approveRequest(${request.id})">Approve</button>
                                <button class="danger-btn" type="button" onclick="rejectRequest(${request.id})">Reject</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderReturns() {
    const returnsTable = document.getElementById('my-returns-table');
    const readyReturnsList = document.getElementById('ready-returns-list');

    if (!state.returns.length) {
        returnsTable.innerHTML = '<div class="empty-state">No return records yet.</div>';
    } else {
        returnsTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Condition</th>
                        <th>Returned Qty</th>
                        <th>Charges</th>
                        <th>Processed By</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.returns.map((item) => `
                        <tr>
                            <td>${item.borrowRequest?.equipment?.name || 'Unknown equipment'}</td>
                            <td>${item.condition}</td>
                            <td>${item.returnedQuantity}</td>
                            <td>${item.charges ? formatCurrency(item.charges) : 'None'}</td>
                            <td>${item.processor ? `${item.processor.firstName} ${item.processor.lastName}` : 'Pending review'}</td>
                            <td>${formatDate(item.returnDate || item.createdAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    const readyReturns = state.requests.filter((request) => canCreateReturn(request));
    readyReturnsList.innerHTML = readyReturns.length
        ? readyReturns.map((request) => `
            <div class="activity-card">
                <h4>${request.equipment?.name || 'Borrowed equipment'}</h4>
                <p>Approved for ${request.requestedQuantity} unit(s), due through ${formatDate(request.endDate)}.</p>
                <div class="button-row">
                    <button class="primary-btn" type="button" onclick="submitReturnForRequest(${request.id})">Submit Return</button>
                </div>
            </div>
        `).join('')
        : '<div class="empty-state">You have no approved requests waiting for return submission.</div>';
}

function renderPendingReturns() {
    const container = document.getElementById('pending-returns-table');
    if (!(state.currentUser.role === 'ADMIN' || state.currentUser.role === 'STAFF')) {
        container.innerHTML = '';
        return;
    }

    if (!state.pendingReturns.length) {
        container.innerHTML = '<div class="empty-state">No pending returns need processing.</div>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Borrower</th>
                    <th>Equipment</th>
                    <th>Condition</th>
                    <th>Qty</th>
                    <th>Charges</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${state.pendingReturns.map((item) => `
                    <tr>
                        <td>${item.borrowRequest?.user?.firstName || ''} ${item.borrowRequest?.user?.lastName || ''}<br><small>${item.borrowRequest?.user?.email || ''}</small></td>
                        <td>${item.borrowRequest?.equipment?.name || 'Unknown equipment'}</td>
                        <td>${item.condition}</td>
                        <td>${item.returnedQuantity}</td>
                        <td>${item.charges ? formatCurrency(item.charges) : 'None'}</td>
                        <td>
                            <button class="primary-btn" type="button" onclick="processReturn(${item.id})">Process Return</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderUsers() {
    const container = document.getElementById('users-table');
    if (state.currentUser.role !== 'ADMIN') {
        container.innerHTML = '';
        return;
    }

    if (!state.users.length) {
        container.innerHTML = '<div class="empty-state">No users found.</div>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Save</th>
                </tr>
            </thead>
            <tbody>
                ${state.users.map((user) => `
                    <tr>
                        <td>${user.firstName} ${user.lastName}</td>
                        <td>${user.email}</td>
                        <td>
                            <select id="role-${user.id}">
                                ${['STUDENT', 'STAFF', 'ADMIN'].map((role) => `
                                    <option value="${role}" ${user.role === role ? 'selected' : ''}>${role}</option>
                                `).join('')}
                            </select>
                        </td>
                        <td>
                            <label style="margin:0;">
                                <input id="active-${user.id}" type="checkbox" ${user.isActive ? 'checked' : ''}>
                                Active
                            </label>
                        </td>
                        <td>
                            <button class="primary-btn" type="button" onclick="saveUserRole(${user.id})">Update</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function borrowEquipment(equipmentId) {
    const quantity = Number(prompt('Quantity to borrow?', '1'));
    if (!quantity || quantity < 1) {
        return;
    }

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000);
    const startDate = prompt('Start date (YYYY-MM-DD)', toInputDate(tomorrow));
    const endDate = prompt('End date (YYYY-MM-DD)', toInputDate(nextWeek));
    const notes = prompt('Notes for this request', 'Borrowing for coursework') || 'Borrowing for coursework';

    if (!startDate || !endDate) {
        return;
    }

    await apiRequest('/requests', {
        method: 'POST',
        body: JSON.stringify({
            equipmentId,
            requestedQuantity: quantity,
            startDate,
            endDate,
            notes,
        }),
    });

    showMessage('Borrow request submitted successfully.', 'success');
    await refreshDashboard();
}

async function cancelRequest(requestId) {
    await apiRequest(`/requests/${requestId}/cancel`, { method: 'PUT' });
    showMessage('Request cancelled.', 'success');
    await refreshDashboard();
}

async function approveRequest(requestId) {
    const notes = prompt('Approval notes (optional)', '') || '';
    await apiRequest(`/requests/${requestId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
    });
    showMessage('Request approved.', 'success');
    await refreshDashboard();
}

async function rejectRequest(requestId) {
    const reason = prompt('Reason for rejection', 'Not enough availability');
    if (!reason) {
        return;
    }

    const notes = prompt('Additional notes (optional)', '') || '';
    await apiRequest(`/requests/${requestId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason, notes }),
    });
    showMessage('Request rejected.', 'success');
    await refreshDashboard();
}

async function submitReturnForRequest(requestId) {
    const condition = prompt('Condition (EXCELLENT, GOOD, FAIR, POOR)', 'GOOD');
    if (!condition) {
        return;
    }

    const damageDescription = prompt('Damage description (optional)', '') || '';
    const notes = prompt('Return notes (optional)', '') || '';

    await apiRequest('/returns', {
        method: 'POST',
        body: JSON.stringify({
            borrowRequestId: requestId,
            condition: condition.toUpperCase(),
            damageDescription,
            notes,
        }),
    });

    showMessage('Return submitted successfully.', 'success');
    await refreshDashboard();
}

async function processReturn(returnId) {
    const additionalCharges = prompt('Additional charges (number only)', '0') || '0';
    const notes = prompt('Processing notes (optional)', '') || '';

    await apiRequest(`/returns/${returnId}/process`, {
        method: 'PUT',
        body: JSON.stringify({
            additionalCharges: Number(additionalCharges),
            notes,
        }),
    });

    showMessage('Return processed.', 'success');
    await refreshDashboard();
}

async function submitEquipmentForm(event) {
    event.preventDefault();

    const equipmentId = document.getElementById('equipment-id').value;
    const specificationsText = document.getElementById('equipment-specifications').value.trim();
    let specifications = undefined;

    if (specificationsText) {
        try {
            specifications = JSON.parse(specificationsText);
        } catch (error) {
            showMessage('Specifications must be valid JSON.', 'error');
            return;
        }
    }

    const payload = {
        name: document.getElementById('equipment-name').value.trim(),
        description: document.getElementById('equipment-description').value.trim(),
        category: document.getElementById('equipment-category').value.trim(),
        subcategory: document.getElementById('equipment-subcategory').value.trim() || undefined,
        location: document.getElementById('equipment-location').value.trim() || 'Main Campus',
        totalQuantity: Number(document.getElementById('equipment-total').value),
        availableQuantity: Number(document.getElementById('equipment-available').value),
        imageUrl: document.getElementById('equipment-image').value.trim() || undefined,
        specifications,
        status: document.getElementById('equipment-status').value,
    };

    const endpoint = equipmentId ? `/equipment/${equipmentId}` : '/equipment';
    const method = equipmentId ? 'PATCH' : 'POST';

    await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
    });

    showMessage(`Equipment ${equipmentId ? 'updated' : 'created'} successfully.`, 'success');
    resetEquipmentForm();
    await refreshDashboard();
}

function populateEquipmentForm(equipmentId) {
    const item = state.equipment.find((equipment) => equipment.id === equipmentId);
    if (!item) {
        return;
    }

    document.getElementById('equipment-id').value = item.id;
    document.getElementById('equipment-name').value = item.name;
    document.getElementById('equipment-category').value = item.category;
    document.getElementById('equipment-subcategory').value = item.subcategory || '';
    document.getElementById('equipment-location').value = item.location || '';
    document.getElementById('equipment-total').value = item.totalQuantity;
    document.getElementById('equipment-available').value = item.availableQuantity;
    document.getElementById('equipment-image').value = item.imageUrl || '';
    document.getElementById('equipment-status').value = item.status || 'AVAILABLE';
    document.getElementById('equipment-description').value = item.description;
    document.getElementById('equipment-specifications').value = item.specifications
        ? JSON.stringify(item.specifications, null, 2)
        : '';

    showMessage(`Editing ${item.name}.`, 'info');
    document.querySelector('[data-section="equipment"]').click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetEquipmentForm() {
    document.getElementById('equipment-form').reset();
    document.getElementById('equipment-id').value = '';
    document.getElementById('equipment-location').value = 'Main Campus';
    document.getElementById('equipment-total').value = '1';
    document.getElementById('equipment-available').value = '1';
    document.getElementById('equipment-status').value = 'AVAILABLE';
}

async function deleteEquipment(equipmentId) {
    if (!confirm('Delete this equipment item?')) {
        return;
    }

    await apiRequest(`/equipment/${equipmentId}`, { method: 'DELETE' });
    showMessage('Equipment deleted.', 'success');
    await refreshDashboard();
}

async function saveUserRole(userId) {
    const role = document.getElementById(`role-${userId}`).value;
    const isActive = document.getElementById(`active-${userId}`).checked;

    await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role, isActive }),
    });

    if (state.currentUser.id === userId) {
        state.currentUser.role = role;
        state.currentUser.isActive = isActive;
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    }

    showMessage('User account updated.', 'success');
    await refreshDashboard();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function getStatsForRole() {
    if (state.currentUser.role === 'ADMIN' && state.report) {
        return [
            { label: 'Users', value: state.report.summary.totalUsers, caption: `${state.report.summary.activeUsers} active accounts` },
            { label: 'Equipment', value: state.report.summary.totalEquipment, caption: `${state.report.summary.totalAvailableUnits} units available` },
            { label: 'Pending Requests', value: state.report.summary.pendingRequests, caption: `${state.report.summary.approvedRequests} approved, ${state.report.summary.completedRequests} completed` },
            { label: 'Pending Returns', value: state.report.summary.pendingReturns, caption: `${state.report.summary.totalReturns} total return records` },
        ];
    }

    return [
        { label: 'Visible Equipment', value: state.equipment.length, caption: `${state.equipment.filter((item) => item.availableQuantity > 0).length} items currently available` },
        { label: 'My Requests', value: state.requests.length, caption: `${countByStatus(state.requests, 'PENDING')} pending decisions` },
        { label: 'Approved Loans', value: countByStatus(state.requests, 'APPROVED'), caption: `${countByStatus(state.requests, 'COMPLETED')} completed historically` },
        { label: 'Returns', value: state.returns.length, caption: `${(state.currentUser.role === 'ADMIN' || state.currentUser.role === 'STAFF') ? state.pendingReturns.length : getReadyReturns().length} awaiting next action` },
    ];
}

function getActivityItems() {
    if (state.currentUser.role === 'ADMIN' && state.report) {
        const items = [];
        state.report.recentRequests.forEach((request) => {
            items.push({
                title: `Request ${request.status}: ${request.equipment?.name || 'Equipment'}`,
                body: `${request.user?.firstName || ''} ${request.user?.lastName || ''} requested ${request.requestedQuantity} unit(s).`,
            });
        });
        state.report.recentReturns.forEach((item) => {
            items.push({
                title: `Return ${item.processor ? 'processed' : 'submitted'}: ${item.borrowRequest?.equipment?.name || 'Equipment'}`,
                body: `${item.borrowRequest?.user?.firstName || ''} ${item.borrowRequest?.user?.lastName || ''} returned ${item.returnedQuantity} unit(s).`,
            });
        });
        return items.slice(0, 8);
    }

    return state.requests.slice(0, 8).map((request) => ({
        title: `${request.status} request for ${request.equipment?.name || 'equipment'}`,
        body: `Scheduled from ${formatDate(request.startDate)} to ${formatDate(request.endDate)}.`,
    }));
}

function countByStatus(items, status) {
    return items.filter((item) => item.status === status).length;
}

function canBorrow(item) {
    return item.availableQuantity > 0 && item.status === 'AVAILABLE';
}

function canCreateReturn(request) {
    return request.status === 'APPROVED' && !state.returns.some((item) => item.borrowRequestId === request.id);
}

function getReadyReturns() {
    return state.requests.filter((request) => canCreateReturn(request));
}

function badgeClassForStatus(status) {
    if (status === 'APPROVED' || status === 'COMPLETED') {
        return 'good';
    }
    if (status === 'REJECTED' || status === 'CANCELLED') {
        return 'danger';
    }
    return 'warn';
}

function formatDate(value) {
    return new Date(value).toLocaleDateString();
}

function toInputDate(date) {
    return date.toISOString().split('T')[0];
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(value));
}

function getSubtitleByRole(role) {
    if (role === 'ADMIN') {
        return 'Monitor campus-wide usage, manage users, control inventory, and keep approvals moving.';
    }
    if (role === 'STAFF') {
        return 'Review requests, process returns, and keep the equipment catalog healthy.';
    }
    return 'Browse the equipment catalog, place borrow requests, and keep track of your returns.';
}

function getSidebarNote(role) {
    if (role === 'ADMIN') {
        return 'Admins can manage users, update roles, oversee system-wide reporting, and control all inventory actions.';
    }
    if (role === 'STAFF') {
        return 'Staff can approve or reject requests, process returns, and maintain equipment records.';
    }
    return 'Students can browse available equipment, submit borrow requests, and return approved items here.';
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('global-message');
    container.textContent = message;
    container.className = `message show ${type}`;
}

function hideMessage() {
    const container = document.getElementById('global-message');
    container.className = 'message info';
    container.textContent = '';
}
