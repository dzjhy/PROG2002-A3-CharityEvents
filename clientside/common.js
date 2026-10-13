/**
 * Loads a shared HTML component into a page element.
 *
 * @async
 * @param {string} elementId - ID of the target element.
 * @param {string} filePath - Path to the HTML component.
 * @returns {Promise<void>} Resolves when the component is loaded.
 */
async function loadComponent(elementId, filePath) {
    const container = document.getElementById(elementId);

    if (!container) {
        return;
    }

    try {
        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}`);
        }

        container.innerHTML = await response.text();
    } catch (error) {
        console.error('Component loading error:', error);
        container.textContent = 'Unable to load page component.';
    }
}

/**
 * Loads the reusable navigation, header and footer.
 *
 * @returns {Promise<void>} Resolves when shared components finish loading.
 */
async function initializeComponents() {
    await Promise.all([
        loadComponent('shared-nav', 'components/nav.html'),
        loadComponent('shared-header', 'components/header.html'),
        loadComponent('shared-footer', 'components/footer.html')
    ]);
}

document.addEventListener('DOMContentLoaded', initializeComponents);