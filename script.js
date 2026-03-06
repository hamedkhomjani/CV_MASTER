document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Elements
    const cvForm = document.getElementById('cv-form');
    const downloadBtn = document.getElementById('download-btn');
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
    
    const previewExperienceList = document.getElementById('preview-experience-list');
    const previewEducationList = document.getElementById('preview-education-list');
    const previewSkillsList = document.getElementById('preview-skills-list');

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
        updateSkillsPreview();
        
        // Refresh icons in preview (since they might be hidden/shown)
        lucide.createIcons();
    }

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

    function updateSkillsPreview() {
        const items = skillsList.querySelectorAll('.skill-name');
        previewSkillsList.innerHTML = '';
        
        items.forEach(item => {
            const val = item.value.trim();
            if (val) {
                const span = document.createElement('span');
                span.className = 'skill-tag';
                span.textContent = val;
                previewSkillsList.appendChild(span);
            }
        });

        document.getElementById('p-skills-sect').style.display = previewSkillsList.children.length > 0 ? 'block' : 'none';
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

    // PDF Download
    downloadBtn.addEventListener('click', () => {
        const fileName = (fullNameInput.value || 'Resume').replace(/\s+/g, '_') + '.pdf';
        
        const opt = {
            margin: 0,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Briefly remove transform for clean capture if needed, 
        // but html2pdf handles standard layout well.
        html2pdf().from(cvPreview).set(opt).save();
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
        fullNameInput.value = "Julianna Vance";
        jobTitleInput.value = "Lead Experience Designer";
        emailInput.value = "julianna.vance@example.com";
        phoneInput.value = "+1 (555) 000-1234";
        locationInput.value = "San Francisco, CA";
        linkedinInput.value = "linkedin.com/in/juliannavance";
        summaryInput.value = "Visionary Experience Designer with over 8 years of expertise in creating intuitive digital ecosystems. Proven track record of leading cross-functional teams to deliver award-winning products that balance business goals with human-centric needs.";
        languagesInput.value = "English (Native), German (Fluent)";

        // One Exp
        createItem(expTemplate, experienceList);
        const lastExp = experienceList.lastElementChild;
        lastExp.querySelector('.exp-title').value = "Senior UX Designer";
        lastExp.querySelector('.exp-company').value = "Creative Pulse Agencies";
        lastExp.querySelector('.exp-dates').value = "2020 - Present";
        lastExp.querySelector('.exp-desc').value = "- Conceptualized and led the redesign of 3 major e-commerce platforms.\n- Increased user engagement by 45% through iterative prototyping.\n- Mentored a team of 5 junior designers.";

        // One Edu
        createItem(eduTemplate, educationList);
        const lastEdu = educationList.lastElementChild;
        lastEdu.querySelector('.edu-degree').value = "M.A. in Interaction Design";
        lastEdu.querySelector('.edu-school').value = "Stanford University";
        lastEdu.querySelector('.edu-dates').value = "2014 - 2016";

        // Some Skills
        ['Figma', 'UI/UX Design', 'Project Management', 'User Research'].forEach(s => {
            createItem(skillTemplate, skillsList);
            skillsList.lastElementChild.querySelector('.skill-name').value = s;
        });

        // Update all
        updatePreview();
        adjustScaling();
    }

    addInitialData();
});
