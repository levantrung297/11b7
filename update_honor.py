import re
import os

filepath = os.path.join("views", "index.ejs")

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the hardcoded honor grid
honor_pattern = re.compile(r'<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">.*?</div>\s*</div>\s*</section>', re.DOTALL)

ejs_honor = """<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <% if(data.honors && data.honors.length > 0) { %>
                    <% data.honors.forEach(function(honor) { %>
                    <div class="glass-card p-6 rounded-3xl text-center relative group hover:-translate-y-2 transition duration-300 border-amber-500/20">
                        <div class="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/20">
                            <img src="<%= honor.image_url || 'https://placehold.co/200x200/2563eb/ffffff' %>" 
                                 alt="<%= honor.name %>" class="w-full h-full object-cover rounded-full">
                        </div>
                        <span class="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
                            <%= honor.badge || '🏆 Bảng Vàng' %>
                        </span>
                        <h4 class="font-bold text-lg text-slate-900 dark:text-white"><%= honor.name %></h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1"><%= honor.description %></p>
                    </div>
                    <% }); %>
                <% } else { %>
                    <div class="col-span-full text-center text-slate-500 py-8">Chưa có dữ liệu bảng vàng</div>
                <% } %>
            </div>
        </div>
    </section>"""

content = honor_pattern.sub(ejs_honor, content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Honor section updated.")
