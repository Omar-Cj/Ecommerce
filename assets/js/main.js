  // Mapping category titles to Font Awesome icons
  const iconMapping = {
    Electronics: "fa-desktop",
    Grocery: "fa-shopping-cart",
    Beauty: "fa-heart",
    Cleaning: "fa-bath",
    Stationary: "fa-pencil",
    Pets: "fa-paw",
    Baking: "fa-birthday-cake",
    Spices: "fa-leaf",
    Toys: "fa-child",
    Magazines: "fa-newspaper-o",
  };

  // Fetch categories from the backend API and populate the menu
  fetch("http://localhost:8000/store/collections/")
    .then((response) => response.json())
    .then((data) => {
      const categoriesList = document.getElementById("categories-list");
      data.results.forEach((category) => {
        const li = document.createElement("li");
        li.innerHTML =
          '<a href="#">' +
          '<i class="fa ' +
          (iconMapping[category.title] || "fa-folder") +
          '"></i> ' +
          category.title +
          " (" +
          category.products_count +
          ")" +
          "</a>";
        categoriesList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });