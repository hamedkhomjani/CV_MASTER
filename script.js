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
    const skillsList = document.getElementById('skills-list');
    const posList = document.getElementById('pos-list');
    const toolsList = document.getElementById('tools-list');
    const testingList = document.getElementById('testing-list');

    const previewExperienceList = document.getElementById('preview-experience-list');
    const previewEducationList = document.getElementById('preview-education-list');
    const previewSkillsList = document.getElementById('preview-skills-list');
    const previewPosList = document.getElementById('preview-pos-list');
    const previewToolsList = document.getElementById('preview-tools-list');
    const previewTestingList = document.getElementById('preview-testing-list');

    // Templates
    const expTemplate = document.getElementById('experience-item-template');
    const eduTemplate = document.getElementById('education-item-template');
    const skillTemplate = document.getElementById('skill-item-template');

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
        updateSkillsPreview(skillsList, previewSkillsList, 'p-skills-sect');
        updateSkillsPreview(posList, previewPosList, 'p-pos-sect');
        updateSkillsPreview(toolsList, previewToolsList, 'p-tools-sect');
        updateSkillsPreview(testingList, previewTestingList, 'p-testing-sect');

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
            skills: [],
            pos: [],
            tools: [],
            testing: []
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

        // Skills
        skillsList.querySelectorAll('.skill-name').forEach(item => {
            data.skills.push(item.value);
        });
        posList.querySelectorAll('.skill-name').forEach(item => {
            data.pos.push(item.value);
        });
        toolsList.querySelectorAll('.skill-name').forEach(item => {
            data.tools.push(item.value);
        });
        testingList.querySelectorAll('.skill-name').forEach(item => {
            data.testing.push(item.value);
        });

        const activeBtn = document.querySelector('.btn-template.active');
        data.template = activeBtn ? activeBtn.dataset.template : 'modern';

        return data;
    }

    /**
     * Saves current form state to localStorage
     */
    function saveData() {
        const data = getFormData();
        localStorage.setItem('archicv-data', JSON.stringify(data));
    }

    /**
     * Loads form state from localStorage
     * Returns true if data was found and loaded
     */
    function loadData() {
        const savedData = localStorage.getItem('archicv-data');
        if (!savedData) return false;

        try {
            const data = JSON.parse(savedData);

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

            skillsList.innerHTML = '';
            if (Array.isArray(data.skills)) {
                data.skills.forEach(skill => {
                    if (skill) {
                        createItem(skillTemplate, skillsList);
                        const last = skillsList.lastElementChild;
                        last.querySelector('.skill-name').value = (typeof skill === 'object' ? (skill.name || skill.skill || '') : skill) || '';
                    }
                });
            }

            posList.innerHTML = '';
            if (Array.isArray(data.pos)) {
                data.pos.forEach(skill => {
                    if (skill) {
                        createItem(skillTemplate, posList);
                        const last = posList.lastElementChild;
                        last.querySelector('.skill-name').value = (typeof skill === 'object' ? (skill.name || skill.skill || '') : skill) || '';
                    }
                });
            }

            toolsList.innerHTML = '';
            if (Array.isArray(data.tools)) {
                data.tools.forEach(skill => {
                    if (skill) {
                        createItem(skillTemplate, toolsList);
                        const last = toolsList.lastElementChild;
                        last.querySelector('.skill-name').value = (typeof skill === 'object' ? (skill.name || skill.skill || '') : skill) || '';
                    }
                });
            }

            testingList.innerHTML = '';
            if (Array.isArray(data.testing)) {
                data.testing.forEach(skill => {
                    if (skill) {
                        createItem(skillTemplate, testingList);
                        const last = testingList.lastElementChild;
                        last.querySelector('.skill-name').value = (typeof skill === 'object' ? (skill.name || skill.skill || '') : skill) || '';
                    }
                });
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

    function updateSkillsPreview(listElement, previewElement, sectionId) {
        const items = listElement.querySelectorAll('.skill-name');
        previewElement.innerHTML = '';

        items.forEach(item => {
            const val = item.value.trim();
            if (val && val !== '[object Object]') {
                const span = document.createElement('span');
                span.className = 'skill-tag';
                span.textContent = val;
                previewElement.appendChild(span);
            }
        });

        document.getElementById(sectionId).style.display = previewElement.children.length > 0 ? 'block' : 'none';
    }

    // --- Dynamic Item Management ---

    function createItem(template, container, updateFn) {
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

    // --- Event Listeners ---

    // Static Inputs
    [fullNameInput, jobTitleInput, emailInput, phoneInput, locationInput, linkedinInput, summaryInput, languagesInput].forEach(el => {
        el.addEventListener('input', updatePreview);
    });

    // Add Buttons
    document.getElementById('add-experience').addEventListener('click', () => createItem(expTemplate, experienceList));
    document.getElementById('add-education').addEventListener('click', () => createItem(eduTemplate, educationList));
    document.getElementById('add-skill').addEventListener('click', () => createItem(skillTemplate, skillsList));
    document.getElementById('add-pos').addEventListener('click', () => createItem(skillTemplate, posList));
    document.getElementById('add-tool').addEventListener('click', () => createItem(skillTemplate, toolsList));
    document.getElementById('add-testing').addEventListener('click', () => createItem(skillTemplate, testingList));

    // PDF Download
    downloadBtn.addEventListener('click', () => {
        const fileName = (fullNameInput.value || 'Resume').replace(/\s+/g, '_') + '.pdf';

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
        locationInput.value = "Älvsjö, Stockholm"; // Fixed: Use locationInput instead of global location
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

        // Skills
        ['UX Research', 'Wireframing', 'Prototyping', 'Lean UX', 'Information Architecture', 'Visual Design'].forEach(s => {
            createItem(skillTemplate, skillsList);
            skillsList.lastElementChild.querySelector('.skill-name').value = s;
        });

        // Product & POS Systems
        ['Purspot POS', 'Retail Management', 'Inventory Systems', 'Payment Gateways'].forEach(s => {
            createItem(skillTemplate, posList);
            posList.lastElementChild.querySelector('.skill-name').value = s;
        });

        // Tools
        ['Figma', 'Adobe XD', 'Rhino (3D)', 'Miro', 'Hotjar'].forEach(s => {
            createItem(skillTemplate, toolsList);
            toolsList.lastElementChild.querySelector('.skill-name').value = s;
        });

        // Product & Testing
        ['Manual Testing', 'User Acceptance Testing (UAT)', 'A/B Testing', 'HTML/CSS/JS'].forEach(s => {
            createItem(skillTemplate, testingList);
            testingList.lastElementChild.querySelector('.skill-name').value = s;
        });

        // Update all
        updatePreview();
        adjustScaling();
    }

    if (!loadData()) {
        addInitialData();
    }
});
