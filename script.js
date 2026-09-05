// ========================================
// ELEMENTS
// ========================================

const productsContainer =
    document.getElementById("productsContainer");

const favoritesContainer =
    document.getElementById("favoritesContainer");

const cartContainer =
    document.getElementById("cartContainer");

const detailsContainer =
    document.getElementById("detailsContainer");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortFilter =
    document.getElementById("sortFilter");

const cartCount =
    document.getElementById("cartCount");

const favoriteCount =
    document.getElementById("favoriteCount");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const summaryItems =
    document.getElementById("summaryItems");


// ========================================
// API
// ========================================

const API_URL =
    "https://fakestoreapi.com/products";


// ========================================
// DATA
// ========================================

let products = [];

let cart =
    JSON.parse(localStorage.getItem("miniStoreCart")) || [];

let favorites =
    JSON.parse(
        localStorage.getItem("miniStoreFavorites")
    ) || [];


// ========================================
// GET PRODUCTS
// ========================================

async function getProducts() {

    try {

        loading.style.display = "flex";

        errorMessage.textContent = "";

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API Error");
        }

        products =
            await response.json();

        createCategories();

        displayProducts(products);

    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            "Unable to load products. Please try again.";

    } finally {

        loading.style.display = "none";

    }
}


// ========================================
// CATEGORIES
// ========================================

function createCategories() {

    const categories = [
        ...new Set(
            products.map(
                product => product.category
            )
        )
    ];

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent =
            formatCategory(category);

        categoryFilter.appendChild(option);

    });
}


function formatCategory(category) {

    const names = {
        "men's clothing": "Men",
        "women's clothing": "Women",
        "jewelery": "Jewelry",
        "electronics": "Electronics"
    };

    return names[category] || category;

}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts(list) {

    productsContainer.innerHTML = "";

    if (list.length === 0) {

        productsContainer.innerHTML = `
            <div class="empty-message">
                <h3>No products found 😔</h3>
                <p>Try another search or category.</p>
            </div>
        `;

        return;
    }


    list.forEach(product => {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        const favorite =
            favorites.includes(product.id);


        card.innerHTML = `

            <div
                class="product-image"
                data-id="${product.id}"
            >

                <img
                    src="${product.image}"
                    alt="${product.title}"
                    loading="lazy"
                >

                <button
                    class="favorite-btn ${
                        favorite ? "active" : ""
                    }"
                    data-id="${product.id}"
                >
                    <i class="fa-solid fa-heart"></i>
                </button>

            </div>


            <div class="product-info">

                <p class="product-category">
                    ${formatCategory(product.category)}
                </p>

                <h3>
                    ${product.title}
                </h3>

                <p class="product-price">
                    ${formatPrice(product.price)}
                </p>

                <div class="product-rating">

                    ${getStars(product.rating.rate)}

                    <span>
                        (${product.rating.count})
                    </span>

                </div>

                <button
                    class="add-cart"
                    data-id="${product.id}"
                >
                    Add to Cart 🛒
                </button>

            </div>
        `;


        productsContainer.appendChild(card);

    });


    attachProductEvents();

}


// ========================================
// PRODUCT EVENTS
// ========================================

function attachProductEvents() {

    document
        .querySelectorAll(".product-image")
        .forEach(image => {

            image.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            ".favorite-btn"
                        )
                    ) {
                        return;
                    }

                    const id =
                        Number(image.dataset.id);

                    showProductDetails(id);

                }
            );

        });


    document
        .querySelectorAll(".favorite-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const id =
                        Number(
                            button.dataset.id
                        );

                    toggleFavorite(id);

                }
            );

        });


    document
        .querySelectorAll(".add-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    addToCart(id);

                }
            );

        });

}


// ========================================
// PRODUCT DETAILS
// ========================================

function showProductDetails(id) {

    const product =
        products.find(
            product => product.id === id
        );

    if (!product) return;


    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.style.display = "none";

        });


    const detailsSection =
        document.getElementById(
            "productDetails"
        );

    detailsSection.style.display =
        "block";


    detailsContainer.innerHTML = `

        <div class="details-image">

            <img
                src="${product.image}"
                alt="${product.title}"
            >

        </div>


        <div class="details-info">

            <span class="details-category">
                ${formatCategory(product.category)}
            </span>

            <h1>
                ${product.title}
            </h1>

            <div class="details-rating">
                ${getStars(product.rating.rate)}
                (${product.rating.count} reviews)
            </div>

            <p class="details-description">
                ${product.description}
            </p>

            <div class="details-price">
                ${formatPrice(product.price)}
            </div>

            <button
                class="details-add"
                id="detailsAdd"
            >
                Add to Cart 🛒
            </button>

        </div>
    `;


    document
        .getElementById("detailsAdd")
        .addEventListener(
            "click",
            () => addToCart(product.id)
        );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// BACK TO SHOP
// ========================================

document
    .getElementById("backToShop")
    .addEventListener(
        "click",
        () => {

            showSection("shop");

        }
    );


// ========================================
// ADD TO CART
// ========================================

function addToCart(id) {

    const existing =
        cart.find(
            item => item.id === id
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            id: id,
            quantity: 1
        });

    }


    saveCart();

    updateCartUI();

}


// ========================================
// REMOVE FROM CART
// ========================================

function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );

    saveCart();

    updateCartUI();

}


// ========================================
// CHANGE QUANTITY
// ========================================

function changeQuantity(id, change) {

    const item =
        cart.find(
            item => item.id === id
        );

    if (!item) return;


    item.quantity += change;


    if (item.quantity <= 0) {

        removeFromCart(id);

        return;

    }


    saveCart();

    updateCartUI();

}


// ========================================
// CART UI
// ========================================

function updateCartUI() {

    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    cartCount.textContent =
        totalQuantity;


    renderCart();

}


// ========================================
// RENDER CART
// ========================================

function renderCart() {

    cartContainer.innerHTML = "";


    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="empty-message">

                <h3>Your cart is empty 🛒</h3>

                <p>
                    Add some products to your cart.
                </p>

            </div>
        `;

        cartSubtotal.textContent =
            "EGP 0";

        cartTotal.textContent =
            "EGP 0";

        summaryItems.textContent =
            "0";

        return;
    }


    let subtotal = 0;

    let itemsNumber = 0;


    cart.forEach(item => {

        const product =
            products.find(
                product => product.id === item.id
            );


        if (!product) return;


        const price =
            convertToEGP(product.price);


        subtotal +=
            price * item.quantity;

        itemsNumber +=
            item.quantity;


        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.title}"
            >


            <div>

                <h3>
                    ${product.title}
                </h3>

                <p class="cart-price">
                    ${formatPrice(product.price)}
                </p>


                <div class="quantity">

                    <button
                        data-action="minus"
                        data-id="${product.id}"
                    >
                        −
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        data-action="plus"
                        data-id="${product.id}"
                    >
                        +
                    </button>

                </div>

            </div>


            <button
                class="remove-btn"
                data-id="${product.id}"
            >
                <i class="fa-solid fa-trash"></i>
                Remove
            </button>

        `;


        cartContainer.appendChild(cartItem);

    });


    cartSubtotal.textContent =
        `EGP ${subtotal.toFixed(0)}`;

    cartTotal.textContent =
        `EGP ${subtotal.toFixed(0)}`;

    summaryItems.textContent =
        itemsNumber;


    attachCartEvents();

}


// ========================================
// CART EVENTS
// ========================================

function attachCartEvents() {

    document
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.id);

                    const change =
                        button.dataset.action === "plus"
                            ? 1
                            : -1;

                    changeQuantity(id, change);

                }
            );

        });


    document
        .querySelectorAll(".remove-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.id);

                    removeFromCart(id);

                }
            );

        });

}


// ========================================
// FAVORITES
// ========================================

function toggleFavorite(id) {

    if (favorites.includes(id)) {

        favorites =
            favorites.filter(
                favoriteId =>
                    favoriteId !== id
            );

    } else {

        favorites.push(id);

    }


    localStorage.setItem(
        "miniStoreFavorites",
        JSON.stringify(favorites)
    );


    updateFavoriteCount();

    displayProducts(
        getFilteredProducts()
    );

    renderFavorites();

}


// ========================================
// FAVORITES UI
// ========================================

function renderFavorites() {

    favoritesContainer.innerHTML = "";


    const favoriteProducts =
        products.filter(
            product =>
                favorites.includes(product.id)
        );


    if (favoriteProducts.length === 0) {

        favoritesContainer.innerHTML = `
            <div class="empty-message">

                <h3>
                    No favorites yet ❤️
                </h3>

                <p>
                    Click the heart on a product
                    to save it.
                </p>

            </div>
        `;

        return;
    }


    favoriteProducts.forEach(product => {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        card.innerHTML = `

            <div
                class="product-image"
                data-id="${product.id}"
            >

                <img
                    src="${product.image}"
                    alt="${product.title}"
                >

                <button
                    class="favorite-btn active"
                    data-id="${product.id}"
                >
                    <i class="fa-solid fa-heart"></i>
                </button>

            </div>


            <div class="product-info">

                <p class="product-category">
                    ${formatCategory(product.category)}
                </p>

                <h3>
                    ${product.title}
                </h3>

                <p class="product-price">
                    ${formatPrice(product.price)}
                </p>

                <button
                    class="add-cart"
                    data-id="${product.id}"
                >
                    Add to Cart 🛒
                </button>

            </div>
        `;


        favoritesContainer.appendChild(card);

    });


    favoritesContainer
        .querySelectorAll(".favorite-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleFavorite(
                        Number(button.dataset.id)
                    );

                }
            );

        });


    favoritesContainer
        .querySelectorAll(".add-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    addToCart(
                        Number(button.dataset.id)
                    );

                }
            );

        });


    favoritesContainer
        .querySelectorAll(".product-image")
        .forEach(image => {

            image.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            ".favorite-btn"
                        )
                    ) return;

                    showProductDetails(
                        Number(image.dataset.id)
                    );

                }
            );

        });

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    () => {

        const results =
            getFilteredProducts();

        displayProducts(results);

        showSection("shop");

    }
);


// ========================================
// FILTER
// ========================================

categoryFilter.addEventListener(
    "change",
    () => {

        displayProducts(
            getFilteredProducts()
        );

    }
);


// ========================================
// SORT
// ========================================

sortFilter.addEventListener(
    "change",
    () => {

        displayProducts(
            getFilteredProducts()
        );

    }
);


// ========================================
// GET FILTERED PRODUCTS
// ========================================

function getFilteredProducts() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    let result =
        products.filter(product => {

            const matchesSearch =
                product.title
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all" ||
                product.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    if (sortFilter.value === "low") {

        result.sort(
            (a, b) =>
                a.price - b.price
        );

    }


    if (sortFilter.value === "high") {

        result.sort(
            (a, b) =>
                b.price - a.price
        );

    }


    return result;

}


// ========================================
// CATEGORY CARDS
// ========================================

document
    .querySelectorAll(".category-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const category =
                    card.dataset.category;


                categoryFilter.value =
                    category;


                showSection("shop");


                displayProducts(
                    getFilteredProducts()
                );

            }
        );

    });


// ========================================
// NAVIGATION
// ========================================

document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const target =
                    link.getAttribute("href");

                if (!target.startsWith("#")) {
                    return;
                }


                const section =
                    document.querySelector(target);


                if (!section) return;


                document
                    .querySelectorAll(".nav-link")
                    .forEach(item =>
                        item.classList.remove("active")
                    );


                link.classList.add("active");

            }
        );

    });


// ========================================
// SHOW SECTION
// ========================================

function showSection(sectionId) {

    const target =
        document.getElementById(sectionId);

    if (!target) return;


    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            if (
                section.id ===
                "productDetails"
            ) {

                section.style.display =
                    "none";

            } else {

                section.style.display =
                    "block";

            }

        });


    target.style.display =
        "block";


    target.scrollIntoView({
        behavior: "smooth"
    });


    if (sectionId === "favorites") {
        renderFavorites();
    }


    if (sectionId === "cart") {
        renderCart();
    }

}


// ========================================
// CHECKOUT
// ========================================

document
    .getElementById("checkoutBtn")
    .addEventListener(
        "click",
        () => {

            if (cart.length === 0) {

                alert(
                    "Your cart is empty!"
                );

                return;

            }


            alert(
                "Thank you! Your order has been placed 🎉"
            );

        }
    );


// ========================================
// LOCAL STORAGE
// ========================================

function saveCart() {

    localStorage.setItem(
        "miniStoreCart",
        JSON.stringify(cart)
    );

}


function updateFavoriteCount() {

    favoriteCount.textContent =
        favorites.length;

}


// ========================================
// PRICE
// ========================================

function convertToEGP(price) {

    return price * 50;

}


function formatPrice(price) {

    return `EGP ${convertToEGP(price).toFixed(0)}`;

}


// ========================================
// STARS
// ========================================

function getStars(rating) {

    const rounded =
        Math.round(rating);

    return (
        "★".repeat(rounded) +
        "☆".repeat(5 - rounded)
    );

}


// ========================================
// START APPLICATION
// ========================================

updateFavoriteCount();

updateCartUI();

getProducts();