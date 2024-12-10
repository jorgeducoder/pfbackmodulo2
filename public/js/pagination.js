document.addEventListener("DOMContentLoaded", function () {
    const currentPage = parseInt("{{page}}");
    const totalPages = parseInt("{{totalPages}}");
  
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");
    const currentPageInfo = document.getElementById("current-page-info");
  
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        window.location.href = `/products?page=${currentPage - 1}`;
      }
    });
  
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        window.location.href = `/products?page=${currentPage + 1}`;
      }
    });
  
    // Mostrar información de la página actual
    currentPageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  });
  