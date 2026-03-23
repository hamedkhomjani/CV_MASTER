document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // ─────────────────────────────────────────────
    // PHOTO UPLOAD
    // ─────────────────────────────────────────────
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoUploadPlaceholder = document.getElementById('photo-upload-placeholder');
    const cvPhoto = document.getElementById('cv-photo');
    const cvPhotoIcon = document.getElementById('cv-photo-icon');

    function applyPhoto(dataUrl) {
        // Form sidebar preview
        photoPreview.src = dataUrl;
        photoPreview.style.display = 'block';
        photoUploadPlaceholder.style.display = 'none';

        // CV preview
        cvPhoto.src = dataUrl;
        cvPhoto.style.display = 'block';
        cvPhotoIcon.style.display = 'none';

        // Save to localStorage
        try { localStorage.setItem('archicv-photo', dataUrl); } catch (e) { }
    }

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => applyPhoto(ev.target.result);
        reader.readAsDataURL(file);
    });

    // Load saved photo if exists
    const savedPhoto = localStorage.getItem('archicv-photo');
    if (savedPhoto) applyPhoto(savedPhoto);

    // Elements
    const cvForm = document.getElementById('cv-form');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const cvPreview = document.getElementById('cv-preview');

    // Personal Info Inputs
    const fullNameInput = document.getElementById('fullName');
    const jobTitleInput = document.getElementById('jobTitle');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    const linkedinInput = document.getElementById('linkedin');
    const summaryInput = document.getElementById('summary');
    const languagesInput = document.getElementById('languages');

    // Preview Elements
    const previewName = document.getElementById('preview-name');
    const previewTitle = document.getElementById('preview-title');
    const previewEmail = document.getElementById('preview-email');
    const previewPhone = document.getElementById('preview-phone');
    const previewLocation = document.getElementById('preview-location');
    const previewLinkedin = document.getElementById('preview-linkedin');
    const previewSummary = document.getElementById('preview-summary');
    const previewLanguages = document.getElementById('preview-languages');

    // Lists
    const experienceList = document.getElementById('experience-list');
    const educationList = document.getElementById('education-list');
    const customSectionsContainer = document.getElementById('custom-sections-container');

    const previewExperienceList = document.getElementById('preview-experience-list');
    const previewEducationList = document.getElementById('preview-education-list');
    const previewCustomSectionsList = document.getElementById('preview-custom-sections');

    // Templates
    const expTemplate = document.getElementById('experience-item-template');
    const eduTemplate = document.getElementById('education-item-template');
    const skillTemplate = document.getElementById('skill-item-template');
    const sectionTemplate = document.getElementById('custom-section-template');

    // --- Core Functions ---

    /**
     * Updates the text content of a preview element based on input.
     * Manages visibility of parent containers if input is empty.
     */
    function updateText(input, preview, wrapper = null) {
        const val = input.value.trim();
        preview.textContent = val || '';

        if (wrapper) {
            wrapper.style.display = val ? 'flex' : 'none';
        }

        // Handle defaults for Name/Title if empty
        if (input === fullNameInput && !val) preview.textContent = 'Your Name';
        if (input === jobTitleInput && !val) preview.textContent = 'Job Title';
    }

    /**
     * Main update function triggered on any input
     */
    function updatePreview() {
        updateText(fullNameInput, previewName);
        updateText(jobTitleInput, previewTitle);
        updateText(emailInput, previewEmail, document.getElementById('preview-email-wrap'));
        updateText(phoneInput, previewPhone, document.getElementById('preview-phone-wrap'));
        updateText(locationInput, previewLocation, document.getElementById('preview-location-wrap'));
        updateText(linkedinInput, previewLinkedin, document.getElementById('preview-linkedin-wrap'));

        // Summary
        previewSummary.textContent = summaryInput.value || 'Write a compelling summary to catch the recruiter\'s eye...';
        document.getElementById('p-summary-sect').style.display = summaryInput.value ? 'block' : 'none';

        // Languages
        previewLanguages.textContent = languagesInput.value;
        document.getElementById('p-languages-sect').style.display = languagesInput.value ? 'block' : 'none';

        // Update Dynamic Sections
        updateExperiencePreview();
        updateEducationPreview();
        updateCustomSectionsPreview();

        // Refresh icons in preview (since they might be hidden/shown)
        lucide.createIcons();

        // Save to localStorage
        saveData();
    }

    /**
     * Serializes all form data into an object
     */
    function getFormData() {
        const data = {
            personal: {
                fullName: fullNameInput.value,
                jobTitle: jobTitleInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                location: locationInput.value,
                linkedin: linkedinInput.value,
                summary: summaryInput.value,
                languages: languagesInput.value
            },
            experience: [],
            education: [],
            customSections: []
        };

        // Experience
        experienceList.querySelectorAll('.dynamic-item').forEach(item => {
            data.experience.push({
                title: item.querySelector('.exp-title').value,
                company: item.querySelector('.exp-company').value,
                dates: item.querySelector('.exp-dates').value,
                desc: item.querySelector('.exp-desc').value
            });
        });

        // Education
        educationList.querySelectorAll('.dynamic-item').forEach(item => {
            data.education.push({
                degree: item.querySelector('.edu-degree').value,
                school: item.querySelector('.edu-school').value,
                dates: item.querySelector('.edu-dates').value
            });
        });

        // Custom Sections
        customSectionsContainer.querySelectorAll('.custom-form-section').forEach(sect => {
            const sectionId = sect.dataset.id || `sect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const title = sect.querySelector('.section-title-input').value;
            const items = [];
            sect.querySelectorAll('.skill-name').forEach(input => {
                if (input.value.trim()) items.push(input.value.trim());
            });
            
            data.customSections.push({
                id: sectionId,
                title: title,
                items: items
            });
        });

        const activeBtn = document.querySelector('.btn-template.active');
        data.template = activeBtn ? activeBtn.dataset.template : 'modern';

        return data;
    }

    /**
     * Saves current form state to localStorage AND the local server
     */
    async function saveData() {
        const data = getFormData();
        
        // Save to browser (backup)
        localStorage.setItem('archicv-data', JSON.stringify(data));

        // Save to Local Database (File)
        try {
            await fetch('/api/cv-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.warn("Server save failed, using local storage only.", e);
        }
    }

    /**
     * Loads form state from server or localStorage
     */
    async function loadData() {
        let data = null;

        // 1. Try to load from Server first
        try {
            const response = await fetch('/api/cv-data');
            if (response.ok) {
                const serverData = await response.json();
                if (serverData && Object.keys(serverData).length > 0) {
                    data = serverData;
                }
            }
        } catch (e) {
            console.warn("Server load failed, falling back to local storage.", e);
        }

        // 2. Fallback to localStorage
        if (!data) {
            const savedData = localStorage.getItem('archicv-data');
            if (savedData) {
                try { data = JSON.parse(savedData); } catch (e) {}
            }
        }

        if (!data) return false;

        try {
            // Personal Info
            fullNameInput.value = data.personal.fullName || '';
            jobTitleInput.value = data.personal.jobTitle || '';
            emailInput.value = data.personal.email || '';
            phoneInput.value = data.personal.phone || '';
            locationInput.value = data.personal.location || '';
            linkedinInput.value = data.personal.linkedin || '';
            summaryInput.value = data.personal.summary || '';
            languagesInput.value = data.personal.languages || '';

            // Dynamic Sections
            experienceList.innerHTML = '';
            data.experience.forEach(exp => {
                createItem(expTemplate, experienceList);
                const last = experienceList.lastElementChild;
                last.querySelector('.exp-title').value = exp.title || '';
                last.querySelector('.exp-company').value = exp.company || '';
                last.querySelector('.exp-dates').value = exp.dates || '';
                last.querySelector('.exp-desc').value = exp.desc || '';
            });

            educationList.innerHTML = '';
            data.education.forEach(edu => {
                createItem(eduTemplate, educationList);
                const last = educationList.lastElementChild;
                last.querySelector('.edu-degree').value = edu.degree || '';
                last.querySelector('.edu-school').value = edu.school || '';
                last.querySelector('.edu-dates').value = edu.dates || '';
            });

            // Handle legacy data structure or new customSections
            customSectionsContainer.innerHTML = '';
            if (data.customSections && Array.isArray(data.customSections)) {
                data.customSections.forEach(sectData => {
                    createCustomSection(sectData);
                });
            } else {
                // Compatibility with old structure (skills, pos, tools, testing)
                if (data.skills) createCustomSection({ title: 'Skills', items: data.skills });
                if (data.pos) createCustomSection({ title: 'Product & POS Systems', items: data.pos });
                if (data.tools) createCustomSection({ title: 'Tools', items: data.tools });
                if (data.testing) createCustomSection({ title: 'Product & Testing', items: data.testing });
            }

            updatePreview();

            // Set initial active template state
            const currentTemplate = data.template || 'modern';
            document.querySelectorAll('.btn-template').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.template === currentTemplate);
            });
            cvPreview.className = `cv-document t-${currentTemplate}`;

            return true;
        } catch (e) {
            console.error("Error loading saved data", e);
            return false;
        }
    }

    // --- Template Switching ---
    document.querySelectorAll('.btn-template').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;

            // UI Toggle
            document.querySelectorAll('.btn-template').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply to Preview
            cvPreview.className = `cv-document t-${template}`;

            // Save state
            saveData();
        });
    });

    function updateExperiencePreview() {
        const items = experienceList.querySelectorAll('.dynamic-item');
        previewExperienceList.innerHTML = '';

        items.forEach(item => {
            const title = item.querySelector('.exp-title').value;
            const company = item.querySelector('.exp-company').value;
            const dates = item.querySelector('.exp-dates').value;
            const desc = item.querySelector('.exp-desc').value;

            if (title || company) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <div class="preview-item-top">
                        <span class="p-item-title">${title || 'Job Title'}</span>
                        <span class="p-item-dates">${dates || ''}</span>
                    </div>
                    <div class="p-item-subtitle">${company || 'Company'}</div>
                    <p class="p-item-desc">${desc || ''}</p>
                `;
                previewExperienceList.appendChild(div);
            }
        });

        document.getElementById('p-experience-sect').style.display = previewExperienceList.children.length > 0 ? 'block' : 'none';
    }

    function updateEducationPreview() {
        const items = educationList.querySelectorAll('.dynamic-item');
        previewEducationList.innerHTML = '';

        items.forEach(item => {
            const degree = item.querySelector('.edu-degree').value;
            const school = item.querySelector('.edu-school').value;
            const dates = item.querySelector('.edu-dates').value;

            if (degree || school) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <div class="preview-item-top">
                        <span class="p-item-title">${degree || 'Degree'}</span>
                        <span class="p-item-dates">${dates || ''}</span>
                    </div>
                    <div class="p-item-subtitle" style="margin-bottom: 0;">${school || 'School/University'}</div>
                `;
                previewEducationList.appendChild(div);
            }
        });

        document.getElementById('p-education-sect').style.display = previewEducationList.children.length > 0 ? 'block' : 'none';
    }

    function updateCustomSectionsPreview() {
        previewCustomSectionsList.innerHTML = '';
        const sections = customSectionsContainer.querySelectorAll('.custom-form-section');

        sections.forEach(sect => {
            const title = sect.querySelector('.section-title-input').value.trim();
            const items = sect.querySelectorAll('.skill-name');
            
            let hasContent = false;
            const previewSect = document.createElement('div');
            previewSect.className = 'cv-section';
            
            const h3 = document.createElement('h3');
            h3.textContent = title || 'Unnamed Section';
            previewSect.appendChild(h3);

            const grid = document.createElement('div');
            grid.className = 'skills-grid';
            
            items.forEach(item => {
                const val = item.value.trim();
                if (val && val !== '[object Object]') {
                    hasContent = true;
                    const span = document.createElement('span');
                    span.className = 'skill-tag';
                    span.textContent = val;
                    grid.appendChild(span);
                }
            });

            if (hasContent) {
                previewSect.appendChild(grid);
                previewCustomSectionsList.appendChild(previewSect);
            }
        });
    }

    // --- Dynamic Item Management (Reordering) ---
    let draggedElement = null;

    function handleDragStart(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        // Required for Firefox
        e.dataTransfer.setData('text/plain', '');
    }

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Auto-scroll the editor container when dragging near edges
        const editorScroll = document.querySelector('.editor-scroll');
        if (editorScroll) {
            const scrollThreshold = 80; // px from top/bottom to start scrolling
            const scrollSpeed = 10;
            const scrollRect = editorScroll.getBoundingClientRect();
            
            if (e.clientY < scrollRect.top + scrollThreshold) {
                editorScroll.scrollTop -= scrollSpeed;
            } else if (e.clientY > scrollRect.bottom - scrollThreshold) {
                editorScroll.scrollTop += scrollSpeed;
            }
        }

        // Add visual indicator class to the target
        const target = e.target.closest('.custom-form-section');
        if (target && target !== draggedElement) {
            target.classList.add('drag-over');
        }

        return false;
    }

    function handleDragLeave(e) {
        const target = e.target.closest('.custom-form-section');
        if (target) {
            target.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        
        const target = e.target.closest('.custom-form-section');
        if (target) {
            target.classList.remove('drag-over');
        }

        if (target && draggedElement !== target) {
            const rect = target.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            // Reorder in DOM
            if (e.clientY < midpoint) {
                customSectionsContainer.insertBefore(draggedElement, target);
            } else {
                customSectionsContainer.insertBefore(draggedElement, target.nextSibling);
            }
            
            updatePreview();
        }
        return false;
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        // Clean up any remaining drag-over classes
        customSectionsContainer.querySelectorAll('.custom-form-section').forEach(s => s.classList.remove('drag-over'));
        draggedElement = null;
    }

    // --- Dynamic Item Management ---

    function createItem(template, container) {
        const clone = template.content.cloneNode(true);
        const item = clone.querySelector('.dynamic-item') || clone.querySelector('.skill-input-wrap');

        // Remove button logic
        const removeBtn = item.querySelector('.btn-remove') || item.querySelector('.btn-remove-sm');
        removeBtn.addEventListener('click', () => {
            item.remove();
            updatePreview();
        });

        // Event listeners for inputs within the item
        const inputs = item.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        container.appendChild(clone);
        lucide.createIcons(); // Initialize icons for the new item
        updatePreview();
    }

    function createCustomSection(data = { title: '', items: [] }) {
        const clone = sectionTemplate.content.cloneNode(true);
        const sect = clone.querySelector('.custom-form-section');
        const titleInput = sect.querySelector('.section-title-input');
        const itemsList = sect.querySelector('.section-items-list');
        const addBtn = sect.querySelector('.add-skill-item');
        const removeSectBtn = sect.querySelector('.btn-remove-section');

        titleInput.value = data.title;
        titleInput.addEventListener('input', updatePreview);

        addBtn.addEventListener('click', () => {
            createItem(skillTemplate, itemsList);
        });

        removeSectBtn.addEventListener('click', () => {
            if (confirm(`Remove entire "${titleInput.value || 'section'}" section?`)) {
                sect.remove();
                updatePreview();
            }
        });

        // Add items if provided
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(val => {
                createItem(skillTemplate, itemsList);
                const last = itemsList.lastElementChild;
                last.querySelector('.skill-name').value = (typeof val === 'object' ? (val.name || val.skill || '') : val) || '';
            });
        }

        // Enable dragging ONLY via handle
        const handle = sect.querySelector('.drag-handle');
        handle.addEventListener('mousedown', () => {
            sect.setAttribute('draggable', 'true');
        });
        handle.addEventListener('mouseup', () => {
            sect.setAttribute('draggable', 'false');
        });

        sect.addEventListener('dragstart', handleDragStart);
        sect.addEventListener('dragover', handleDragOver);
        sect.addEventListener('dragleave', handleDragLeave);
        sect.addEventListener('drop', handleDrop);
        sect.addEventListener('dragend', () => {
            handleDragEnd.call(sect);
            sect.setAttribute('draggable', 'false');
        });

        customSectionsContainer.appendChild(clone);
        lucide.createIcons();
        updatePreview();
    }

    // --- Event Listeners ---

    // Static Inputs
    [fullNameInput, jobTitleInput, emailInput, phoneInput, locationInput, linkedinInput, summaryInput, languagesInput].forEach(el => {
        el.addEventListener('input', updatePreview);
    });

    // Add Buttons
    document.getElementById('add-experience').addEventListener('click', () => createItem(expTemplate, experienceList));
    document.getElementById('add-education').addEventListener('click', () => createItem(eduTemplate, educationList));
    document.getElementById('add-new-section').addEventListener('click', () => createCustomSection());

    // PDF Download
    downloadBtn.addEventListener('click', () => {
        const namePart = (fullNameInput.value || 'Resume').trim().replace(/\s+/g, '_');
        const titlePart = (jobTitleInput.value || '').trim().replace(/\s+/g, '_');
        const fileName = (titlePart ? `${namePart}_${titlePart}` : namePart) + '.pdf';

        // ─── Step 1: Remove CSS scale so html2pdf captures real size ───
        const savedTransform = cvPreview.style.transform;
        const savedWidth = cvPreview.style.width;
        cvPreview.style.transform = 'none';
        cvPreview.style.width = '210mm';

        const opt = {
            margin: 0,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        // ─── Step 2: Generate PDF, then restore transform ───
        html2pdf()
            .set(opt)
            .from(cvPreview)
            .save()
            .then(() => {
                cvPreview.style.transform = savedTransform;
                cvPreview.style.width = savedWidth;
            });
    });

    // Reset Data
    resetBtn.addEventListener('click', () => {
        if (confirm("Reset to default content? This will clear all your current data.")) {
            localStorage.removeItem('archicv-data');
            localStorage.removeItem('archicv-photo');
            location.reload();
        }
    });

    // Preview Scaling logic
    function adjustScaling() {
        const previewPane = document.querySelector('.preview-pane');
        const previewDoc = document.querySelector('.cv-document');
        const containerWidth = previewPane.clientWidth - 80; // Padding
        const docWidth = 793.7; // 210mm in px at 96dpi (approx)

        if (containerWidth < docWidth) {
            const scale = containerWidth / docWidth;
            previewDoc.style.transform = `scale(${scale})`;
            document.querySelector('.preview-zoom-info').textContent = `Scaled to ${Math.round(scale * 100)}%`;
        } else {
            previewDoc.style.transform = `scale(1)`;
            document.querySelector('.preview-zoom-info').textContent = `Original Size`;
        }
    }

    window.addEventListener('resize', adjustScaling);

    // --- Initial Setup & Dummy Data ---

    function addInitialData() {
        // Personal
        fullNameInput.value = "Hamed Khomjani";
        jobTitleInput.value = "UX/UI Designer";
        emailInput.value = "eng.h.khomjani@gmail.com";
        phoneInput.value = "0762573273";
        locationInput.value = "Älvsjö, Stockholm"; 
        linkedinInput.value = "behance.net/hamedkhomjanidesign";
        summaryInput.value = "Dynamic UX/UI Designer with a proven track record at Purspot AB, enhancing user engagement through innovative design and responsive platforms. Expert in Figma and adept at fostering collaboration, I've significantly streamlined workflows and improved productivity. My designs, grounded in UX research, elevate usability and aesthetics, consistently meeting project goals.";
        languagesInput.value = "Persian (Native), English (C1), Swedish (A2), German (A2)";

        // Experience
        const expData = [
            {
                title: "UX/UI Designer",
                company: "Purspot AB - Stockholm",
                dates: "May 2022 - Current",
                desc: "- Developed responsive platforms across multi-viewport devices.\n- Optimized enterprise app interfaces for large-scale organizations.\n- Defined typography and iconography standards for mobile/web.\n- Created UX deliverables: task analyses, storyboards, and use cases."
            },
            {
                title: "UX/UI Designer",
                company: "ILISH - Stockholm",
                dates: "May 2020 - April 2022",
                desc: "- Improved layouts to achieve usability and performance objectives.\n- Documented style guidelines for high-traffic mobile apps.\n- Collaborated with dev teams to ensure pixel-perfect implementation."
            },
            {
                title: "UX Designer",
                company: "Gapfilm - Tehran",
                dates: "March 2018 - April 2020",
                desc: "- Implemented Scrum methodology in software development cycles.\n- Generated UX research and user flow concepts for media apps.\n- Crafted icon sets and brand-aligned mobile interfaces."
            }
        ];

        expData.forEach(exp => {
            createItem(expTemplate, experienceList);
            const last = experienceList.lastElementChild;
            last.querySelector('.exp-title').value = exp.title;
            last.querySelector('.exp-company').value = exp.company;
            last.querySelector('.exp-dates').value = exp.dates;
            last.querySelector('.exp-desc').value = exp.desc;
        });

        // Education
        const eduData = [
            { degree: "AI in Design & Mobile UX", school: "ProApp Online", dates: "Dec 2024" },
            { degree: "Diploma Frontend Developer", school: "Hyper Island Stockholm", dates: "2021" },
            { degree: "B.S. Chemical Engineering", school: "Azad University", dates: "2014" }
        ];

        eduData.forEach(edu => {
            createItem(eduTemplate, educationList);
            const last = educationList.lastElementChild;
            last.querySelector('.edu-degree').value = edu.degree;
            last.querySelector('.edu-school').value = edu.school;
            last.querySelector('.edu-dates').value = edu.dates;
        });

        // Custom Sections
        createCustomSection({
            title: 'Skills',
            items: ['UX Research', 'Wireframing', 'Prototyping', 'Lean UX', 'Information Architecture', 'Visual Design']
        });

        createCustomSection({
            title: 'Product & POS Systems',
            items: ['Purspot POS', 'Retail Management', 'Inventory Systems', 'Payment Gateways']
        });

        createCustomSection({
            title: 'Tools',
            items: ['Figma', 'Adobe XD', 'Rhino (3D)', 'Miro', 'Hotjar']
        });

        createCustomSection({
            title: 'Product & Testing',
            items: ['Manual Testing', 'User Acceptance Testing (UAT)', 'A/B Testing', 'HTML/CSS/JS']
        });

        // Update all
        updatePreview();
        adjustScaling();
    }

    (async () => {
        if (!await loadData()) {
            addInitialData();
        }
    })();
});
