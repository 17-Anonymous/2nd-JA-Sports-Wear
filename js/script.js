import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
    import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
    import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
    import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ja-sportswear-production';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "demo-key",
    authDomain: "demo-app.firebaseapp.com",
    projectId: "demo-app",
    storageBucket: "demo-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const whatsappPhone = "923431934185";
const adminPasscode = "Jawad#576";
const maxProductImages = 3;
const maxImageSizeBytes = 8 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
let productsStore = [];
let activeCategoryFilter = "All Products";
let searchQuery = "";
let isAuthenticatedAdmin = false;
let showFeaturedOnly = true;
let productImageSlots = Array.from({ length: maxProductImages }, () => ({ file: null, url: '', storagePath: '' }));

const productImageMap = {
    "t-shirt": [
        "images/T%20shirts%20(1).jpeg",
        "images/T%20shirts%20(2).jpeg",
        "images/T%20shirts%20(3).jpeg"
    ],
    "hoodie": [
        "images/hoodies%20(1).jpeg",
        "images/hoodies%20(2).jpeg",
        "images/hoodies%20(3).jpeg"
    ],
    "basketball-uniform": [
        "images/basketball%20(1).jpeg",
        "images/basketball%20(2).jpeg",
        "images/basketball%20(3).jpeg"
    ],
    "baseball-uniform": [
        "images/baseball%20(1).jpeg",
        "images/baseball%20(2).jpeg",
        "images/baseball%20(3).jpeg"
    ],
    "american-football-uniform": [
        "images/american%20football%20uniforms%20(1).jpeg",
        "images/american%20football%20uniforms%20(2).jpeg",
        "images/american%20football%20uniforms%20(3).jpeg"
    ],
    "7-on-7-uniform": [
        "images/7%20on%207%20(1).jpeg",
        "images/7%20on%207%20(2).jpeg",
        "images/7%20on%207%20(3).jpeg"
    ],
    "bowling-shirts": [
        "images/cricket%20shirts%20(1).jpeg",
        "images/cricket%20shirts%20(2).jpeg",
        "images/cricket%20shirts%20(3).jpeg"
    ],
    "2-button-jerseys": [
        "images/2%20button%20jersey%20(1).jpeg",
        "images/2%20button%20jersey%20(2).jpeg",
        "images/2%20button%20jersey%20(3).jpeg"
    ],
    "tracksuits": [
        "images/tracksuits%20(1).jpeg",
        "images/tracksuits%20(2).jpeg",
        "images/tracksuits%20(3).jpeg"
    ],
    "backpack": [
        "images/bag%20back%20(1).jpeg",
        "images/bag%20back%20(2).jpeg",
        "images/bag%20back%20(3).jpeg"
    ],
    "cheerleader-uniform": [
        "images/cheerleader%20uniforms%20(1).jpeg",
        "images/cheerleader%20uniforms%20(2).jpeg",
        "images/cheerleader%20uniforms%20(3).jpeg"
    ],
    "baseball-jerseys": [
        "images/baseball%20jersey%20(1).jpeg",
        "images/baseball%20jersey.jpeg",
        "images/baseball%20jersey%20(3).jpeg"
    ],
    "baseball-pants": [
        "images/baseball%20pants%20(1).jpeg",
        "images/baseball%20pants%20(2).jpeg",
        "images/baseball%20pants%20(3).jpeg"
    ],
    "american-football-non-padded-uniform": [
        "images/american%20football%20non%20paded%201.jpeg",
        "images/american%20football%20non%20paded%202.jpeg",
        "images/american%20football%20non%20paded%203.jpeg"
    ],
    "coashing-shirt": [
        "images/coaching%20shirts%20(5).jpeg",
        "images/coaching%20shirts%20(6).jpeg",
        "images/coaching%20shirts.jpeg"
    ]
};

const productGallery = (categoryKey) => productImageMap[categoryKey] || [];

// 15 PRODUCTS WITH EXACT CATEGORY MAPPING TO REAL LOCAL IMAGES
const initialSeedProducts = [
    {
        id: "custom-t-shirt-collection",
        title: "Custom T-Shirt Collection",
        slug: "custom-t-shirt-collection",
        category: "T-shirt",
        badge: "BEST SELLER",
        image: productGallery("t-shirt")[0],
        images: productGallery("t-shirt"),
        imageAlt: "Custom sports T-shirt collection by JA Sports Wear",
        shortDescription: "Premium custom T-shirts with breathable performance fabric for clubs and brands.",
        fullDescription: "Premium custom T-shirt collection designed for athletes, clubs, and teams. Lightweight, breathable, and easy to personalize with logos, names, numbers, and custom graphics. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom T-Shirt Collection | JA Sports Wear",
        seoMetaDescription: "Premium custom sports T-shirts with performance fabric, full sublimation, and custom team branding.",
        isPublished: true,
        isFeatured: true
    },
    {
        id: "blue-lightning-hoodie",
        title: "Blue Lightning Oversized Hoodie",
        slug: "blue-lightning-oversized-hoodie",
        category: "Hoodie",
        badge: "NEW ARRIVAL",
        image: productGallery("hoodie")[0],
        images: productGallery("hoodie"),
        imageAlt: "Blue Lightning Oversized Hoodie by JA Sports Wear",
        shortDescription: "Premium oversized hoodie with bold custom graphic styling and heavyweight fleece feel.",
        fullDescription: "Premium oversized hoodie in a modern streetwear silhouette with bold custom graphic detailing. Built for comfort, warmth, and athletic performance with durable fabric and a comfortable fit. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Blue Lightning Oversized Hoodie | JA Sports Wear",
        seoMetaDescription: "Custom oversized hoodie with premium fleece and bold graphics for teams and streetwear branding.",
        isPublished: true,
        isFeatured: true
    },
    {
        id: "custom-basketball-uniform",
        title: "Custom Basketball Uniform",
        slug: "custom-basketball-uniform",
        category: "Basketball-Uniform",
        badge: "20% OFF",
        image: productGallery("basketball-uniform")[0],
        images: productGallery("basketball-uniform"),
        imageAlt: "Custom basketball uniform set by JA Sports Wear",
        shortDescription: "High-performance custom basketball uniform with team-ready fit and vibrant graphics.",
        fullDescription: "Custom basketball uniform built for agility, comfort, and team identity. Designed with breathable performance fabric, durable stitching, and full-color team graphics for a polished on-court appearance. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Basketball Uniform | JA Sports Wear",
        seoMetaDescription: "Custom basketball uniforms with breathable fabric, team colors, and sublimated designs for clubs and leagues.",
        isPublished: true,
        isFeatured: true
    },
    {
        id: "custom-baseball-uniform",
        title: "Custom Baseball Uniform",
        slug: "custom-baseball-uniform",
        category: "Baseball-Uniform",
        badge: "TRENDING",
        image: productGallery("baseball-uniform")[0],
        images: productGallery("baseball-uniform"),
        imageAlt: "Custom baseball uniform design by JA Sports Wear",
        shortDescription: "Custom baseball uniform with performance comfort for training, games, and club teams.",
        fullDescription: "Custom baseball uniform crafted for comfort and confidence across every inning. Built with lightweight, breathable fabric and full-color team graphics to help players look sharp and perform at their best. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Baseball Uniform | JA Sports Wear",
        seoMetaDescription: "Custom baseball uniforms for clubs and academies with premium fabric, bold colors, and team branding.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-american-football-uniform",
        title: "Custom American Football Uniform",
        slug: "custom-american-football-uniform",
        category: "American-Football-Uniform",
        badge: "CUSTOM",
        image: productGallery("american-football-uniform")[0],
        images: productGallery("american-football-uniform"),
        imageAlt: "Custom American Football Uniform by JA Sports Wear",
        shortDescription: "Custom American football uniform for teams who want elite fit and bold team identity.",
        fullDescription: "Custom American football uniform produced for competitive clubs and academy teams. The lightweight structure supports movement while the artwork, colors, names, and numbers create a professional match-day identity. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom American Football Uniform | JA Sports Wear",
        seoMetaDescription: "Custom American football uniforms with breathable fabric, team colors, and personalized graphics.",
        isPublished: true,
        isFeatured: true
    },
    {
        id: "custom-7-on-7-football-uniform",
        title: "Custom 7 on 7 Football Uniform",
        slug: "custom-7-on-7-football-uniform",
        category: "7-on-7-Uniform",
        badge: "CUSTOM",
        image: productGallery("7-on-7-uniform")[0],
        images: productGallery("7-on-7-uniform"),
        imageAlt: "Custom 7 on 7 football uniform by JA Sports Wear",
        shortDescription: "Custom 7 on 7 football uniform built for speed, comfort, and competitive match-day energy.",
        fullDescription: "Custom 7 on 7 football uniform made with lightweight, breathable fabric for fast-paced play. Personalize your team look with colors, logos, names, and numbers for a premium finish. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom 7 on 7 Football Uniform | JA Sports Wear",
        seoMetaDescription: "Order custom 7 on 7 football uniforms with professional graphics, custom names, and breathable performance fabric.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-bowling-shirt",
        title: "Custom Bowling Team Shirt",
        slug: "custom-bowling-team-shirt",
        category: "Bowling-Shirts",
        badge: "CUSTOM",
        image: productGallery("bowling-shirts")[0],
        images: productGallery("bowling-shirts"),
        imageAlt: "Custom bowling team shirt by JA Sports Wear",
        shortDescription: "Professional custom bowling shirt with breathable performance material and clean team styling.",
        fullDescription: "Custom bowling team shirt designed for comfort and polished presentation. Built with breathable, lightweight fabric and customizable team colors, logos, and names for leagues, clubs, and tournaments. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Bowling Team Shirts | JA Sports Wear",
        seoMetaDescription: "Premium custom bowling shirts with breathable performance fabric and professional team branding.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-2-button-baseball-jersey",
        title: "Custom 2 Button Baseball Jersey",
        slug: "custom-2-button-baseball-jersey",
        category: "2-Button-Jerseys",
        badge: "CUSTOM",
        image: productGallery("2-button-jerseys")[0],
        images: productGallery("2-button-jerseys"),
        imageAlt: "Custom 2 button baseball jersey by JA Sports Wear",
        shortDescription: "Custom 2 button baseball jersey designed for comfortable game-day movement and team performance.",
        fullDescription: "Custom 2 button baseball jersey built for training, league play, and team presentation. Lightweight, comfortable, and fully customizable with your team logo, colors, number, and name. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom 2 Button Baseball Jerseys | JA Sports Wear",
        seoMetaDescription: "Custom 2 button baseball jerseys with team branding, durable fabric, and premium fit for clubs and academies.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "premium-green-white-tracksuit-set",
        title: "Premium Green White Tracksuit Set",
        slug: "premium-green-white-tracksuit-set",
        category: "Tracksuits",
        badge: "PREMIUM",
        image: productGallery("tracksuits")[0],
        images: productGallery("tracksuits"),
        imageAlt: "Premium tracksuit set by JA Sports Wear",
        shortDescription: "Premium custom tracksuit set for warm-up, travel, and lightweight training performance.",
        fullDescription: "Premium green and white tracksuit set designed for athletes and teams who want coordinated performance wear. The modern fit blends comfort, mobility, and team identity with custom details and durable quality. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Premium Green White Tracksuit Set | JA Sports Wear",
        seoMetaDescription: "Custom tracksuits with lightweight performance fabric and premium styling for athletes and clubs.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-team-sports-backpack",
        title: "Custom Team Sports Backpack",
        slug: "custom-team-sports-backpack",
        category: "Backpack",
        badge: "CUSTOM",
        image: productGallery("backpack")[0],
        images: productGallery("backpack"),
        imageAlt: "Custom sports backpack by JA Sports Wear",
        shortDescription: "Durable custom backpack for training gear, travel, and team essentials.",
        fullDescription: "Custom team sports backpack designed for practical performance and everyday use. Spacious enough for training gear and travel essentials while still allowing for club branding, color identity, and custom logo printing. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Team Sports Backpack | JA Sports Wear",
        seoMetaDescription: "Custom sports backpacks built for athletics, branded team gear, and everyday carrying with durable materials.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-cheerleader-uniform",
        title: "Custom Cheerleader Uniform",
        slug: "custom-cheerleader-uniform",
        category: "Cheerleader-Uniform",
        badge: "CUSTOM",
        image: productGallery("cheerleader-uniform")[0],
        images: productGallery("cheerleader-uniform"),
        imageAlt: "Custom cheerleader uniform by JA Sports Wear",
        shortDescription: "Custom cheerleader uniform with motion-friendly tailoring and polished team styling.",
        fullDescription: "Custom cheerleader uniform designed for comfort, movement, and coordinated team presentation. Choose your team colors, graphics, trim, and logo details for a standout look that performs brightly on the floor. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Cheerleader Uniform | JA Sports Wear",
        seoMetaDescription: "Custom cheerleader uniforms with performance fabric, team colors, and polished styling for schools and teams.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-baseball-jersey-set",
        title: "Custom Baseball Jersey Set",
        slug: "custom-baseball-jersey-set",
        category: "Baseball-Jerseys",
        badge: "CUSTOM",
        image: productGallery("baseball-jerseys")[0],
        images: productGallery("baseball-jerseys"),
        imageAlt: "Custom baseball jersey set by JA Sports Wear",
        shortDescription: "Professional custom baseball jersey set with team colors, names, and premium finishing.",
        fullDescription: "Custom baseball jersey set for clubs, academies, and competitive teams. Engineered for comfort and durability with full-color team graphics, player names, and numbers for a professional finish. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Baseball Jersey Set | JA Sports Wear",
        seoMetaDescription: "Custom baseball jersey sets with premium prints, team branding, and lightweight sports fabric.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-baseball-pants",
        title: "Custom Baseball Pants",
        slug: "custom-baseball-pants",
        category: "Baseball-Pants",
        badge: "CUSTOM",
        image: productGallery("baseball-pants")[0],
        images: productGallery("baseball-pants"),
        imageAlt: "Custom baseball pants by JA Sports Wear",
        shortDescription: "Durable custom baseball pants built for mobility, comfort, and complete team matching.",
        fullDescription: "Custom baseball pants designed to coordinate with the team jersey while supporting comfortable field movement. Durable construction, custom colors, and premium finishing make them ideal for squads, academies, and competitive teams. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Baseball Pants | JA Sports Wear",
        seoMetaDescription: "Custom baseball pants with durable construction and team-matching colors for clubs and leagues.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-american-football-non-padded-uniform",
        title: "Custom American Football Non Padded Uniform",
        slug: "custom-american-football-non-padded-uniform",
        category: "American-Football-Non-Padded-Uniform",
        badge: "CUSTOM",
        image: productGallery("american-football-non-padded-uniform")[0],
        images: productGallery("american-football-non-padded-uniform"),
        imageAlt: "Custom non padded American football uniform by JA Sports Wear",
        shortDescription: "Lightweight non-padded American football uniform for comfort, speed, and confident team presentation.",
        fullDescription: "Custom non-padded American football uniform built for unrestricted movement and lightweight comfort. Ideal for competitive teams seeking clean design, breathable fabric, and fully personalized team graphics. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom American Football Non Padded Uniform | JA Sports Wear",
        seoMetaDescription: "Lightweight custom non padded American football uniforms with team graphics and performance comfort.",
        isPublished: true,
        isFeatured: false
    },
    {
        id: "custom-coaching-shirt",
        title: "Custom Coaching Shirt",
        slug: "custom-coaching-shirt",
        category: "Coashing Shirt",
        badge: "CUSTOM",
        image: productGallery("coashing-shirt")[0],
        images: productGallery("coashing-shirt"),
        imageAlt: "Custom coaching shirt by JA Sports Wear",
        shortDescription: "Custom coaching shirt with breathable fabric, professional appearance, and club-level identity.",
        fullDescription: "Custom coaching shirt designed for comfortable daily wear and polished team presentation. Perfect for staff, trainers, and club personnel with options for custom branding, team colors, and logos. Made in Sialkot Pakistan with worldwide shipping.",
        seoTitle: "Custom Coaching Shirt | JA Sports Wear",
        seoMetaDescription: "Custom coaching shirts with breathable fabric and team branding for staff, academies, and clubs.",
        isPublished: true,
        isFeatured: false
    }
];

async function initAuthAndFirestore() {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }

        const productsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');

        onSnapshot(productsCollectionRef, (snapshot) => {
            const loaded = [];
            snapshot.forEach(doc => {
                loaded.push({ id: doc.id, ...doc.data() });
            });

            if (loaded.length === 0) {
                seedInitialProducts(productsCollectionRef);
            } else {
                ensureCatalogProducts(productsCollectionRef, loaded);
                productsStore = loaded;
                renderProductGrid();
                updateAdminProductTable();
            }
        }, (error) => {
            console.warn("Firestore sync fallback to initial seed:", error);
            productsStore = [...initialSeedProducts];
            renderProductGrid();
            updateAdminProductTable();
        });

    } catch (err) {
        console.warn("Auth initialization warning:", err);
        productsStore = [...initialSeedProducts];
        renderProductGrid();
        updateAdminProductTable();
    }
}

async function seedInitialProducts(collectionRef) {
    for (const prod of initialSeedProducts) {
        await setDoc(doc(collectionRef, prod.id), prod);
    }
}

async function ensureCatalogProducts(collectionRef, loadedProducts) {
    const loadedById = new Map(loadedProducts.map(product => [product.id, product]));

    for (const product of initialSeedProducts) {
        if (!loadedById.has(product.id)) {
            await setDoc(doc(collectionRef, product.id), product);
        } else {
            await setDoc(doc(collectionRef, product.id), {
                image: product.image,
                imageAlt: product.imageAlt
            }, { merge: true });
        }
    }

    const reclassifiedProduct = loadedById.get('men-sports-wear-collection');
    if (reclassifiedProduct && reclassifiedProduct.category === 'Tracksuits') {
        await setDoc(doc(collectionRef, reclassifiedProduct.id), {
            ...reclassifiedProduct,
            category: 'Coashing Shirt'
        });
    }
}

function renderProductGrid() {
    const container = document.getElementById('products-grid-container');
    if (!container) return;
    container.innerHTML = '';

    const sectionWrap = container.parentElement;
    const exploreButtonId = 'explore-products-button';
    const existingExploreButton = document.getElementById(exploreButtonId);

    if (existingExploreButton) {
        existingExploreButton.remove();
    }

    const sourceProducts = showFeaturedOnly
        ? productsStore.filter(product => product.isFeatured).slice(0, 4)
        : productsStore;

    const filtered = sourceProducts.filter(p => {
        const titleLower = (p.title || "").toLowerCase();
        const catLower = (p.category || "").toLowerCase();
        const descLower = (p.shortDescription || p.fullDescription || "").toLowerCase();

        let matchesCategory = true;
        if (activeCategoryFilter !== "All" && activeCategoryFilter !== "All Products") {
            const normalizedFilter = normalizeCategoryValue(activeCategoryFilter);
            const normalizedCategory = normalizeCategoryValue(p.category || '');
            matchesCategory = normalizedCategory === normalizedFilter;
        }

        const matchesSearch = searchQuery === "" ||
            titleLower.includes(searchQuery) ||
            catLower.includes(searchQuery) ||
            descLower.includes(searchQuery);

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'text-center w-full';
        emptyMsg.style.gridColumn = '1 / -1';
        emptyMsg.style.padding = '40px 0';

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-shirt text-muted';
        icon.style.fontSize = '36px';
        icon.style.marginBottom = '10px';

        const text = document.createElement('p');
        text.textContent = 'No matching products found.';
        text.style.color = 'var(--text-muted)';

        emptyMsg.appendChild(icon);
        emptyMsg.appendChild(text);
        container.appendChild(emptyMsg);
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'product-img-wrapper';

        const badge = document.createElement('span');
        badge.className = 'badge-custom';
        badge.textContent = product.badge || 'CUSTOM';

        const primaryImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (product.image || '');
        const img = document.createElement('img');
        img.src = primaryImage;
        img.alt = product.imageAlt || product.title;
        img.loading = "lazy";
        img.onerror = () => { img.src = 'https://placehold.co/600x600/111111/FFFFFF?text=JA+Sports+Wear'; };

        imgWrapper.appendChild(badge);
        imgWrapper.appendChild(img);

        const details = document.createElement('div');
        details.className = 'product-details';

        const categoryEl = document.createElement('div');
        categoryEl.className = 'product-category';
        categoryEl.textContent = product.category;

        const titleEl = document.createElement('h3');
        titleEl.className = 'product-title';
        titleEl.textContent = product.title;

        const descEl = document.createElement('p');
        descEl.className = 'product-short-desc';
        descEl.textContent = product.shortDescription || product.fullDescription;

        details.appendChild(categoryEl);
        details.appendChild(titleEl);
        details.appendChild(descEl);

        const actionBtnWrapper = document.createElement('div');
        actionBtnWrapper.style.padding = '0 18px 18px 18px';

        const btn = document.createElement('button');
        btn.className = 'btn-see-details';
        btn.onclick = () => openProductDetailModal(product.id);

        const btnIcon = document.createElement('i');
        btnIcon.className = 'fa-solid fa-eye';

        btn.appendChild(btnIcon);
        btn.appendChild(document.createTextNode(' See Details'));
        actionBtnWrapper.appendChild(btn);

        const topContent = document.createElement('div');
        topContent.appendChild(imgWrapper);
        topContent.appendChild(details);

        card.appendChild(topContent);
        card.appendChild(actionBtnWrapper);

        container.appendChild(card);
    });

    if (showFeaturedOnly && sectionWrap && !sectionWrap.querySelector('#' + exploreButtonId)) {
        const exploreButton = document.createElement('button');
        exploreButton.id = exploreButtonId;
        exploreButton.type = 'button';
        exploreButton.className = 'btn-primary explore-products-btn';
        exploreButton.textContent = 'Explore All Products';
        exploreButton.onclick = () => {
            showFeaturedOnly = false;
            activeCategoryFilter = 'All Products';
            const allButtons = document.querySelectorAll('.category-pills .pill-btn');
            allButtons.forEach(button => button.classList.toggle('active', button.textContent.trim() === 'All Products'));
            renderProductGrid();
        };
        sectionWrap.appendChild(exploreButton);
    }
}

window.openProductDetailModal = function(id) {
    const product = productsStore.find(p => p.id === id);
    if (!product) return;

    const contentContainer = document.getElementById('modal-detail-content');
    contentContainer.innerHTML = '';

    const galleryImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
    const galleryMain = document.createElement('div');
    galleryMain.className = 'product-gallery-main';

    const mainImage = document.createElement('img');
    mainImage.src = galleryImages[0];
    mainImage.alt = product.imageAlt || product.title;
    mainImage.className = 'product-modal-img';
    galleryMain.appendChild(mainImage);

    const thumbsWrap = document.createElement('div');
    thumbsWrap.className = 'product-gallery-thumbs';

    galleryImages.forEach((imageSrc, index) => {
        const thumbButton = document.createElement('button');
        thumbButton.type = 'button';
        thumbButton.className = 'product-gallery-thumb' + (index === 0 ? ' active' : '');
        thumbButton.setAttribute('aria-label', `View image ${index + 1} for ${product.title}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = imageSrc;
        thumbImg.alt = `${product.title} image ${index + 1}`;
        thumbImg.loading = 'lazy';

        thumbButton.appendChild(thumbImg);
        thumbButton.onclick = () => {
            mainImage.src = imageSrc;
            mainImage.alt = `${product.title} image ${index + 1}`;
            document.querySelectorAll('.product-gallery-thumb').forEach((thumb) => thumb.classList.remove('active'));
            thumbButton.classList.add('active');
        };

        thumbsWrap.appendChild(thumbButton);
    });

    const cat = document.createElement('span');
    cat.style.color = 'var(--primary-red)';
    cat.style.fontSize = '11px';
    cat.style.fontWeight = '700';
    cat.style.textTransform = 'uppercase';
    cat.textContent = product.category;

    const title = document.createElement('h2');
    title.id = 'modal-product-title';
    title.style.fontFamily = 'var(--font-heading)';
    title.style.fontSize = '22px';
    title.style.margin = '4px 0 10px 0';
    title.textContent = product.title;

    const desc = document.createElement('p');
    desc.style.fontSize = '13px';
    desc.style.color = 'var(--text-muted)';
    desc.style.lineHeight = '1.6';
    desc.textContent = product.fullDescription || product.shortDescription;

    const waMsg = `Hi JA Sports Wear, I am interested in ordering: ${product.title} (Category: ${product.category})`;
    const waUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(waMsg)}`;

    const waBtn = document.createElement('a');
    waBtn.href = waUrl;
    waBtn.target = '_blank';
    waBtn.rel = 'noopener noreferrer';
    waBtn.className = 'btn-order-wa';

    const waIcon = document.createElement('i');
    waIcon.className = 'fa-brands fa-whatsapp';
    waIcon.style.fontSize = '20px';

    waBtn.appendChild(waIcon);
    waBtn.appendChild(document.createTextNode(' Order / Inquire On WhatsApp'));

    contentContainer.appendChild(galleryMain);
    contentContainer.appendChild(thumbsWrap);
    contentContainer.appendChild(cat);
    contentContainer.appendChild(title);
    contentContainer.appendChild(desc);
    contentContainer.appendChild(waBtn);

    document.getElementById('product-detail-modal').classList.add('open');
};

window.closeProductDetailModal = function() {
    document.getElementById('product-detail-modal').classList.remove('open');
};

function normalizeCategoryValue(value) {
    return (value || '')
        .toLowerCase()
        .replace(/[_\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/tracksuit(s)?/g, 'tracksuits')
        .replace(/coaching-shirt/g, 'coashing-shirt')
        .replace(/coaching\s+shirt/g, 'coashing-shirt')
        .replace(/coashing-shirt/g, 'coashing-shirt')
        .trim();
}

window.filterProducts = function(category, element) {
    showFeaturedOnly = false;
    activeCategoryFilter = category;
    document.querySelectorAll('.category-pills .pill-btn').forEach(b => b.classList.remove('active'));
    if (element) element.classList.add('active');
    renderProductGrid();
};

window.handleProductSearch = function() {
    const input = document.getElementById('product-search-input');
    searchQuery = input.value.trim().toLowerCase();
    showFeaturedOnly = false;
    renderProductGrid();
};

window.openAdminPortalModal = function() {
    document.getElementById('admin-portal-modal').classList.add('open');
};

window.closeAdminPortalModal = function() {
    document.getElementById('admin-portal-modal').classList.remove('open');
};

window.handleAdminLogin = function(e) {
    e.preventDefault();
    const passcode = document.getElementById('admin-passcode-input').value.trim();

    if (passcode === adminPasscode) {
        isAuthenticatedAdmin = true;
        document.getElementById('admin-login-view').style.display = 'none';
        document.getElementById('admin-dashboard-view').style.display = 'block';
        document.getElementById('admin-btn-label').textContent = 'Admin Dashboard';
        showToast("Authenticated as Administrator");
        updateAdminProductTable();
        return;
    }

    showToast("Secure admin authentication is required.");
};

window.handleAdminLogout = function() {
    isAuthenticatedAdmin = false;
    document.getElementById('admin-login-view').style.display = 'block';
    document.getElementById('admin-dashboard-view').style.display = 'none';
    document.getElementById('admin-btn-label').textContent = 'Admin Portal';
    document.getElementById('admin-passcode-input').value = '';
    showToast("Logged out successfully");
};

window.switchAdminTab = function(tab) {
    const formSection = document.getElementById('admin-form-section');
    const listSection = document.getElementById('admin-list-section');
    const tabAdd = document.getElementById('tab-btn-add');
    const tabList = document.getElementById('tab-btn-list');

    if (tab === 'form') {
        formSection.style.display = 'block';
        listSection.style.display = 'none';
        tabAdd.classList.add('active');
        tabList.classList.remove('active');
    } else {
        formSection.style.display = 'none';
        listSection.style.display = 'block';
        tabAdd.classList.remove('active');
        tabList.classList.add('active');
    }
};

function setProductImageStatus(message, isError = false) {
    const status = document.getElementById('product-image-upload-status');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('error', isError);
}

function validateImageFile(file) {
    if (!file) return 'Please choose an image file.';
    if (!allowedImageTypes.includes(file.type)) return 'Use JPG, JPEG, PNG or WebP images only.';
    if (file.size > maxImageSizeBytes) return 'Each image must be 8 MB or smaller.';
    return '';
}

function validateSelectedImageFiles(files) {
    const invalidFile = files.map(validateImageFile).find(Boolean);
    if (invalidFile) return invalidFile;
    const signatures = files.map(file => `${file.name}:${file.size}:${file.lastModified}`);
    return new Set(signatures).size !== signatures.length ? 'Choose 3 different image files.' : '';
}

function renderProductImageSlots() {
    const container = document.getElementById('product-image-slots');
    if (!container) return;
    container.innerHTML = '';

    productImageSlots.forEach((slot, index) => {
        const slotElement = document.createElement('div');
        slotElement.className = 'product-image-slot';

        const label = document.createElement('span');
        label.className = 'product-image-slot-label';
        label.textContent = `Image ${index + 1}`;

        const preview = document.createElement('div');
        preview.className = 'product-image-preview';
        if (slot.file || slot.url) {
            const image = document.createElement('img');
            image.src = slot.file ? URL.createObjectURL(slot.file) : slot.url;
            image.alt = `Product image ${index + 1} preview`;
            preview.appendChild(image);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fa-regular fa-image';
            preview.appendChild(icon);
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/webp';
        input.hidden = true;
        input.id = `prod-image-slot-${index}`;
        input.addEventListener('change', () => {
            const file = input.files[0];
            const duplicate = productImageSlots.some((slot, slotIndex) => slotIndex !== index && slot.file && slot.file.name === file?.name && slot.file.size === file?.size && slot.file.lastModified === file?.lastModified);
            const error = validateImageFile(file) || (duplicate ? 'Choose a different image for each slot.' : '');
            if (error) {
                input.value = '';
                setProductImageStatus(error, true);
                return;
            }
            productImageSlots[index] = { file, url: '', storagePath: '' };
            setProductImageStatus('Image selected. Choose all 3 images before saving.');
            renderProductImageSlots();
        });

        const replaceLabel = document.createElement('label');
        replaceLabel.className = 'pill-btn product-image-replace';
        replaceLabel.htmlFor = input.id;
        replaceLabel.innerHTML = '<i class="fa-solid fa-rotate"></i> Replace';

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'product-image-remove';
        removeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeButton.title = `Remove Image ${index + 1}`;
        removeButton.setAttribute('aria-label', `Remove Image ${index + 1}`);
        removeButton.addEventListener('click', () => {
            productImageSlots[index] = { file: null, url: '', storagePath: '' };
            setProductImageStatus('Image removed. Select a replacement before saving.', true);
            renderProductImageSlots();
        });

        slotElement.appendChild(label);
        slotElement.appendChild(preview);
        slotElement.appendChild(input);
        slotElement.appendChild(replaceLabel);
        slotElement.appendChild(removeButton);
        container.appendChild(slotElement);
    });
    updateImageSaveButtonState();
}

function validateProductImageSlots() {
    if (productImageSlots.length !== maxProductImages || productImageSlots.some(slot => !slot.file && !slot.url)) {
        return 'Please select exactly 3 product images before saving.';
    }
    return '';
}

function updateImageSaveButtonState() {
    const saveButton = document.querySelector('#product-management-form button[type="submit"]');
    if (saveButton) saveButton.disabled = Boolean(validateProductImageSlots());
}

function uploadProductImage(file, productId, slotIndex, onProgress) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
    const storagePath = `products/${productId}/${Date.now()}-${slotIndex + 1}-${safeName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });
        uploadTask.on('state_changed', snapshot => {
            onProgress(snapshot.bytesTransferred / snapshot.totalBytes);
        }, reject, async () => {
            try {
                resolve({ url: await getDownloadURL(uploadTask.snapshot.ref), storagePath });
            } catch (error) {
                reject(error);
            }
        });
    });
}

async function deleteStoredProductImages(storagePaths) {
    for (const storagePath of (storagePaths || [])) {
        if (!storagePath) continue;
        await deleteObject(ref(storage, storagePath));
    }
}

window.handleSaveProduct = async function(e) {
    e.preventDefault();
    if (!isAuthenticatedAdmin) {
        showToast('Please authenticate as an administrator first.');
        return;
    }

    const imageError = validateProductImageSlots();
    if (imageError) {
        setProductImageStatus(imageError, true);
        showToast(imageError);
        return;
    }

    const form = document.getElementById('product-management-form');
    const saveButton = form.querySelector('button[type="submit"]');
    const editingId = document.getElementById('prod-edit-id').value;
    const id = editingId || 'prod-' + Date.now();
    const title = document.getElementById('prod-title').value;
    const previousProduct = productsStore.find(product => product.id === id);
    const uploadedFiles = [];
    const imageUrls = [];
    const imageStoragePaths = [];

    saveButton.disabled = true;
    setProductImageStatus('Uploading images: 0%');

    try {
        for (let index = 0; index < maxProductImages; index += 1) {
            const slot = productImageSlots[index];
            if (slot.file) {
                const uploaded = await uploadProductImage(slot.file, id, index, progress => {
                    const completed = index * 100;
                    const percentage = Math.round((completed + progress * 100) / maxProductImages);
                    setProductImageStatus(`Uploading images: ${percentage}%`);
                });
                imageUrls.push(uploaded.url);
                imageStoragePaths.push(uploaded.storagePath);
                uploadedFiles.push(uploaded.storagePath);
            } else {
                imageUrls.push(slot.url);
                imageStoragePaths.push(slot.storagePath || '');
            }
        }

        const productData = {
            id,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            category: document.getElementById('prod-category').value,
            badge: document.getElementById('prod-badge').value,
            image: imageUrls[0],
            images: imageUrls,
            imageStoragePaths,
            imageAlt: document.getElementById('prod-image-alt').value,
            shortDescription: document.getElementById('prod-short-desc').value,
            fullDescription: document.getElementById('prod-full-desc').value,
            seoTitle: document.getElementById('prod-seo-title').value,
            seoMetaDescription: document.getElementById('prod-seo-desc').value,
            isPublished: true,
            isFeatured: previousProduct?.isFeatured ?? true
        };

        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', id);
        await setDoc(docRef, productData);

        const replacedPaths = productImageSlots
            .map((slot, index) => slot.file && previousProduct?.imageStoragePaths?.[index])
            .filter(Boolean);
        if (replacedPaths.length) {
            await deleteStoredProductImages(replacedPaths).catch(cleanupError => {
                console.warn('Previous image cleanup failed after save:', cleanupError);
            });
        }

        setProductImageStatus('Images uploaded successfully.');
        showToast(editingId ? 'Product updated successfully!' : 'New product added!');
        resetProductForm();
    } catch (err) {
        console.error('Error saving product or uploading images:', err);
        await deleteStoredProductImages(uploadedFiles).catch(cleanupError => console.warn('Image cleanup failed:', cleanupError));
        setProductImageStatus(`Upload failed: ${err.message || 'Please try again.'}`, true);
        showToast('Product was not saved. Please check Firebase Storage and try again.');
    } finally {
        updateImageSaveButtonState();
    }
};

window.resetProductForm = function() {
    document.getElementById('product-management-form').reset();
    document.getElementById('prod-edit-id').value = '';
    productImageSlots = Array.from({ length: maxProductImages }, () => ({ file: null, url: '', storagePath: '' }));
    renderProductImageSlots();
    setProductImageStatus('Choose exactly 3 images to continue.');
    document.getElementById('admin-form-title').textContent = 'Add New Product';
    document.getElementById('cancel-edit-btn').style.display = 'none';
};

window.editProduct = function(id) {
    const prod = productsStore.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('prod-edit-id').value = prod.id;
    document.getElementById('prod-title').value = prod.title || '';
    document.getElementById('prod-category').value = prod.category || 'Jerseys & Uniforms';
    document.getElementById('prod-badge').value = prod.badge || '';
    const existingImages = Array.isArray(prod.images) ? prod.images.slice(0, maxProductImages) : [prod.image || ''];
    productImageSlots = Array.from({ length: maxProductImages }, (_, index) => ({
        file: null,
        url: existingImages[index] || '',
        storagePath: prod.imageStoragePaths?.[index] || ''
    }));
    renderProductImageSlots();
    setProductImageStatus('Replace any image, or leave the current images unchanged.');
    document.getElementById('prod-image-alt').value = prod.imageAlt || '';
    document.getElementById('prod-short-desc').value = prod.shortDescription || '';
    document.getElementById('prod-full-desc').value = prod.fullDescription || '';
    document.getElementById('prod-seo-title').value = prod.seoTitle || '';
    document.getElementById('prod-seo-desc').value = prod.seoMetaDescription || '';

    document.getElementById('admin-form-title').textContent = 'Edit Product';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    switchAdminTab('form');
};

window.deleteProduct = async function(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    if (!isAuthenticatedAdmin) {
        showToast('Please authenticate as an administrator first.');
        return;
    }

    const product = productsStore.find(item => item.id === id);

    try {
        await deleteStoredProductImages(product?.imageStoragePaths);
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', id);
        await deleteDoc(docRef);
        showToast("Product deleted!");
    } catch (err) {
        console.error("Error deleting product:", err);
        showToast('Product was not deleted. Image cleanup or Firestore access failed.');
    }
};

function updateAdminProductTable() {
    const countEl = document.getElementById('admin-product-count');
    if (countEl) countEl.textContent = productsStore.length;

    const tbody = document.getElementById('admin-product-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    productsStore.forEach(prod => {
        const tr = document.createElement('tr');

        const tdImg = document.createElement('td');
        const img = document.createElement('img');
        img.src = prod.image;
        img.className = 'admin-table-img';
        img.alt = prod.title;
        img.onerror = () => { img.src = 'https://placehold.co/40x40/111111/FFFFFF?text=JA'; };
        tdImg.appendChild(img);

        const tdTitle = document.createElement('td');
        tdTitle.textContent = prod.title;

        const tdCat = document.createElement('td');
        tdCat.textContent = prod.category;

        const tdActions = document.createElement('td');

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-action-icon btn-action-edit';
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.onclick = () => editProduct(prod.id);

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-action-icon btn-action-delete';
        delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        delBtn.onclick = () => deleteProduct(prod.id);

        tdActions.appendChild(editBtn);
        tdActions.appendChild(delBtn);

        tr.appendChild(tdImg);
        tr.appendChild(tdTitle);
        tr.appendChild(tdCat);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
}

window.handleQuoteSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('quote-name').value;
    const email = document.getElementById('quote-email').value;
    const phone = document.getElementById('quote-phone').value;
    const country = document.getElementById('quote-country').value;
    const product = document.getElementById('quote-product').value;
    const qty = document.getElementById('quote-qty').value;
    const msg = document.getElementById('quote-msg').value;

    const text = `New Quote Request:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}\nProduct: ${product}\nQuantity: ${qty}\nMessage: ${msg}`;
    const waUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    showToast("Quote request submitted!");
    document.getElementById('contact-quote-form').reset();
};

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Hero Slider Logic
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

window.goToSlide = function(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active-slide', i === index);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active-dot', i === index);
    });
    currentSlide = index;
};

function autoSlide() {
    if (slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}

setInterval(autoSlide, 5000);

// Mobile Navigation Toggle
const hamburgerBtn = document.getElementById('hamburger-toggle');
const mobileDropdown = document.getElementById('mobile-dropdown');

if (hamburgerBtn && mobileDropdown) {
    hamburgerBtn.addEventListener('click', () => {
        mobileDropdown.classList.toggle('open');
    });

    // FIX: Auto-close the mobile menu whenever a link/button inside it is clicked
    mobileDropdown.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', () => {
            mobileDropdown.classList.remove('open');
        });
    });
}

const productImagesInput = document.getElementById('prod-images-input');
if (productImagesInput) {
    productImagesInput.addEventListener('change', () => {
        const files = Array.from(productImagesInput.files);
        if (files.length !== maxProductImages) {
            productImagesInput.value = '';
            setProductImageStatus('Choose exactly 3 images at once, or replace images individually.', true);
            return;
        }

        const invalidFile = validateSelectedImageFiles(files);
        if (invalidFile) {
            productImagesInput.value = '';
            setProductImageStatus(invalidFile, true);
            return;
        }

        productImageSlots = files.map(file => ({ file, url: '', storagePath: '' }));
        setProductImageStatus('3 images selected and ready to upload.');
        renderProductImageSlots();
    });
}

renderProductImageSlots();
setProductImageStatus('Choose exactly 3 images to continue.');

// Initialize application
initAuthAndFirestore();
