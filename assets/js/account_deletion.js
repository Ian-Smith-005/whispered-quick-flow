  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const deleteInput = document.getElementById('deleteConfirmInput');
  const deleteError = document.getElementById('deleteError');
  const deleteSuccess = document.getElementById('deleteSuccess');
  const deleteModal = document.getElementById('deleteModal');

  confirmDeleteBtn.addEventListener('click', () => {
    const value = deleteInput.value.trim();

    if (value === 'DELETE') {
      deleteError.classList.add('d-none');
      deleteSuccess.classList.remove('d-none');

      // Wait 3 seconds before redirect
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
    } else {
      deleteSuccess.classList.add('d-none');
      deleteError.classList.remove('d-none');
    }
  });

  // Reset state on modal close
  deleteModal.addEventListener('hidden.bs.modal', () => {
    deleteInput.value = '';
    deleteError.classList.add('d-none');
    deleteSuccess.classList.add('d-none');
  });
