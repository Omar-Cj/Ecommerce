let currentPage = 1;
      const displayCount = 8; // Number of products to show per page

      // Fetch products from backend (backend returns 10 items per page)
      function fetchProducts(page = 1) {
        fetch(
          `https://suuqcasri-production-839407217d71.herokuapp.com/store/products/?page=${page}`
        )
          .then((response) => response.json())
          .then((data) => {
            const container = document.getElementById("products-container");
            container.innerHTML = "";
            // Display only the first 8 products from the backend result
            const productsToShow = data.results.slice(0, displayCount);
            productsToShow.forEach((product) => {
              const imageSrc =
                product.images && product.images.length > 0
                  ? product.images[0].image
                  : "../assets/img/product-1.jpg";
              const price = product.unit_price;
              const discountedPrice =
                product.discount && product.discount > 0
                  ? (price - (price * product.discount) / 100).toFixed(2)
                  : price.toFixed(2);
              const productHTML = `
                <div class="col-4 product-details-container" onclick="window.location.href='pages/product-details.html?productId=${product.id}'">
                  <img src="${imageSrc}" alt="${product.title}" />
                  <h4>${product.title}</h4>
                  <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star-o"></i>
                  </div>
                  <p>$${discountedPrice}</p>
                </div>
              `;
              container.insertAdjacentHTML("beforeend", productHTML);
            });
            updatePaginationButtons(data);
          })
          .catch((error) => {
            console.error("Error fetching products:", error);
          });
      }

      // Update pagination buttons dynamically based on total product count
      function updatePaginationButtons(data) {
        const totalProducts = data.count;
        // Compute total pages based on 8 products per page
        const totalPages = Math.ceil(totalProducts / displayCount);
        const paginationContainer = document.getElementById("pagination-container");
        paginationContainer.innerHTML = "";

        // For simplicity, display up to 4 page numbers
        for (let i = 1; i <= totalPages && i <= 4; i++) {
          paginationContainer.insertAdjacentHTML(
            "beforeend",
            `<span class="${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</span>`
          );
        }
        // Next arrow if currentPage is less than totalPages
        if (currentPage < totalPages) {
          paginationContainer.insertAdjacentHTML(
            "beforeend",
            `<span onclick="changePage(${currentPage + 1})">&#8594;</span>`
          );
        }
      }

      function changePage(page) {
        currentPage = page;
        fetchProducts(currentPage);
      }

      document.addEventListener("DOMContentLoaded", () => {
        fetchProducts(currentPage);
      });