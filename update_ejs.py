import re
import os

filepath = os.path.join("views", "index.ejs")

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the Guestbook form
old_form = '<form id="guestbookForm" onsubmit="handleGuestbookSubmit(event)" class="glass-card p-6 rounded-3xl space-y-4">'
new_form = '<form id="guestbookForm" method="POST" action="/guestbook" class="glass-card p-6 rounded-3xl space-y-4">'
content = content.replace(old_form, new_form)

# Remove required client-side guestbook submission since we use POST
old_gb_js = """        function handleGuestbookSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('gbName').value.trim();
            const group = document.getElementById('gbGroup').value;
            const msg = document.getElementById('gbMessage').value.trim();

            if(!name || !msg) return;

            const saved = localStorage.getItem('11b7_guestbook');
            const messages = saved ? JSON.parse(saved) : defaultMessages;

            const newMsg = {
                name: name,
                group: group,
                msg: msg,
                time: "Vừa xong"
            };

            messages.unshift(newMsg);
            localStorage.setItem('11b7_guestbook', JSON.stringify(messages));

            // Reset Form & Reload Feed
            document.getElementById('guestbookForm').reset();
            loadGuestbook();
        }"""
content = content.replace(old_gb_js, "")

# Now inject server-side data into JS
# Find the line: const membersData = [ ... ];
# Since we know the line numbers roughly, let's use regex

members_pattern = re.compile(r'const membersData = \[[^;]+\];', re.DOTALL)
content = members_pattern.sub('const membersData = <%- JSON.stringify(data.members || []) %>;', content)

gallery_pattern = re.compile(r'const galleryData = \[[^;]+\];', re.DOTALL)
content = gallery_pattern.sub('const galleryData = <%- JSON.stringify(data.gallery || []) %>;', content)

timetable_pattern = re.compile(r'const timetableData = \{[^;]+\};', re.DOTALL)
content = timetable_pattern.sub('const timetableDataRaw = <%- JSON.stringify(data.schedule || []) %>;\n        const timetableData = {"T2":[],"T3":[],"T4":[],"T5":[],"T6":[],"T7":[]};\n        timetableDataRaw.forEach(item => timetableData[item.day].push(item));', content)

guestbook_pattern = re.compile(r'const defaultMessages = \[[^;]+\];', re.DOTALL)
content = guestbook_pattern.sub('const defaultMessages = <%- JSON.stringify(data.guestbook || []) %>;', content)

# Change loadGuestbook to not use localStorage, just use defaultMessages which is now data.guestbook
old_load_gb = """        function loadGuestbook() {
            const saved = localStorage.getItem('11b7_guestbook');
            const messages = saved ? JSON.parse(saved) : defaultMessages;"""
new_load_gb = """        function loadGuestbook() {
            const messages = defaultMessages;"""
content = content.replace(old_load_gb, new_load_gb)

# Change time formatting in guestbook
content = content.replace("${m.time || 'Vừa xong'}", "${new Date(m.created_at).toLocaleDateString('vi-VN') || 'Vừa xong'}")
content = content.replace("m.msg", "m.message")
content = content.replace("${m.img}", "${m.avatar_url || 'https://placehold.co/200x200/2563eb/ffffff?text=' + encodeURIComponent(m.name)}")
content = content.replace("${m.hobby}", "${m.description || 'Không có'}")
content = content.replace("${m.quote}", "${m.description || 'Không có'}")
content = content.replace("m.group.toString()", "m.group_name.toString()")
content = content.replace("Tổ ${m.group}", "${m.group_name}")
content = content.replace("${m.role}", "${m.nickname || ''}")

# Fix guestbook feed form names
content = content.replace('id="gbName"', 'id="gbName" name="gbName"')
content = content.replace('id="gbGroup"', 'id="gbGroup" name="gbGroup"')
content = content.replace('id="gbMessage"', 'id="gbMessage" name="gbMessage"')

# Save file
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("index.ejs updated successfully.")
