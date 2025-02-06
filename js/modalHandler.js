// Modal handling functionality
export function initializeModal() {
    const modal = document.getElementById('protocolImageModal');
    const modalContent = modal.querySelector('.modal-content');
    const minimizeBtn = modal.querySelector('.modal-minimize');
    const maximizeBtn = modal.querySelector('.modal-maximize');
    const closeBtn = modal.querySelector('.modal-close');
    const modalTitle = modal.querySelector('#modalTitle');

    // Modal controls
    minimizeBtn.addEventListener('click', () => {
        modalContent.classList.toggle('minimized');
        if (modalContent.classList.contains('maximized')) {
            modalContent.classList.remove('maximized');
        }
    });

    maximizeBtn.addEventListener('click', () => {
        modalContent.classList.toggle('maximized');
        if (modalContent.classList.contains('minimized')) {
            modalContent.classList.remove('minimized');
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        modalContent.classList.remove('minimized', 'maximized');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalContent.classList.remove('minimized', 'maximized');
        }
    });

    return {
        showModal: (title, images) => {
            modalTitle.textContent = title;
            const gallery = modal.querySelector('#protocolImages');
            gallery.innerHTML = images.map((image, index) => `
                <div class="image-wrapper">
                    <img src="${image.data}" alt="Protocol page ${image.pageNumber}">
                    <div class="page-number">Page ${image.pageNumber}</div>
                </div>
            `).join('');
            modal.style.display = 'block';
        }
    };
}