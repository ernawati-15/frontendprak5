// 1. Ambil data dari localStorage atau gunakan mock data default
const ambilProdukDariStorage = () => {
    const dataDisimpan = localStorage.getItem('ethereal_products');
    if (dataDisimpan) {
        try {
            return JSON.parse(dataDisimpan);
        } catch (e) {
            console.error("Gagal parsing data localStorage", e);
        }
    }
    return [
        { id: 1, name: "Teh Original", price: 3500, category: "Minuman", stock: 50, active: true },
        { id: 2, name: "Teh Susu", price: 5000, category: "Minuman", stock: 30, active: true },
        { id: 3, name: "Teh Yakult", price: 7000, category: "Minuman", stock: 25, active: true }
    ];
};

let localProductList = ambilProdukDariStorage();
let idEditAktif = null;

const simpanKeStorage = () => {
    localStorage.setItem('ethereal_products', JSON.stringify(localProductList));
};

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};

// ====================================================
// FUNGSI RENDER GLOBAL (Katalog & Tabel)
// ====================================================
const renderProducts = () => {
    const productContainer = document.getElementById('product-container');
    const tableBody = document.getElementById('table-product-body');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    const keyword = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';

    const filteredList = localProductList.filter(prod => {
        const matchesName = prod.name.toLowerCase().includes(keyword);
        const matchesCategory = selectedCategory === '' || prod.category === selectedCategory;
        return matchesName && matchesCategory;
    });

    // 1. Render Katalog Kartu Produk (Warna Tombol Hapus Toska #2dbcd6)
    if (productContainer) {
        productContainer.innerHTML = '';
        const activeList = filteredList.filter(p => p.active !== false);
        if (activeList.length === 0) {
            productContainer.innerHTML = '<p style="color: #666; font-size: 14px;">Belum ada produk aktif dalam katalog.</p>';
        } else {
            activeList.forEach((prod) => {
                const card = document.createElement('article');
                card.className = 'product-card';
                card.setAttribute('data-id', prod.id);

                card.innerHTML = `
                    <div>
                        <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #2c3e50;">${prod.name}</h4>
                        <p style="margin: 4px 0; font-size: 13px;">Kategori: ${prod.category}</p>
                        <p style="margin: 4px 0; font-size: 13px;">Harga: ${formatRupiah(prod.price)}</p>
                        <p style="margin: 4px 0 12px 0; font-size: 13px;">Stok: ${prod.stock}</p>
                    </div>
                    <button type="button" onclick="handleDeleteProduct(${prod.id})" style="background: #2dbcd6; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Hapus</button>
                `;
                productContainer.append(card);
            });
        }
    }

    // 2. Render Tabel Kelola Data Produk
    if (tableBody) {
        tableBody.innerHTML = '';
        if (filteredList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">Tidak ada data produk.</td></tr>`;
        } else {
            filteredList.forEach((prod, index) => {
                const isAktif = prod.active !== false;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${prod.name}</td>
                    <td>${formatRupiah(prod.price)}</td>
                    <td>${prod.category}</td>
                    <td>${prod.stock}</td>
                    <td>
                        <button type="button" class="btn-action-edit" onclick="handleEditProduct(${prod.id})">Edit</button>
                        <button type="button" class="btn-action-status" onclick="handleToggleStatus(${prod.id})">${isAktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
                        <button type="button" class="btn-action-delete" onclick="handleDeleteProduct(${prod.id})">Hapus</button>
                    </td>
                `;
                tableBody.append(tr);
            });
        }
    }
};

// ====================================================
// EVENT LISTENER UTAMA
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    const inputName = document.getElementById('product-name');
    const inputCategory = document.getElementById('product-category');
    const inputPrice = document.getElementById('product-price');
    const inputStock = document.getElementById('product-stock');

    const previewName = document.getElementById('preview-name');
    const previewCategory = document.getElementById('preview-category');
    const previewPrice = document.getElementById('preview-price');
    const previewStock = document.getElementById('preview-stock');

    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    // Tombol Batal Edit
    let batalBtn = document.getElementById('btn-cancel-edit');
    if (!batalBtn && form) {
        batalBtn = document.createElement('button');
        batalBtn.id = 'btn-cancel-edit';
        batalBtn.type = 'button';
        batalBtn.textContent = 'Batal Edit';
        batalBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 8px; width: 100%; display: none;';
        form.append(batalBtn);

        batalBtn.addEventListener('click', () => {
            idEditAktif = null;
            form.reset();
            if (submitBtn) submitBtn.textContent = "Simpan Produk";
            batalBtn.style.display = 'none';
            if (feedback) {
                feedback.textContent = "";
                feedback.className = "";
            }
            previewName.textContent = '-';
            previewCategory.textContent = '-';
            previewPrice.textContent = '-';
            previewStock.textContent = '-';
        });
    }

    renderProducts();

    // Live Preview
    if (inputName) inputName.addEventListener('input', (e) => { previewName.textContent = e.target.value.trim() || '-'; });
    if (inputCategory) inputCategory.addEventListener('change', (e) => { previewCategory.textContent = e.target.value || '-'; });
    if (inputPrice) inputPrice.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        previewPrice.textContent = !isNaN(val) && val >= 0 ? formatRupiah(val) : '-';
    });
    if (inputStock) inputStock.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        previewStock.textContent = !isNaN(val) && val >= 0 ? val : '-';
    });

    // Form Submit
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const nameVal = inputName.value.trim();
            const categoryVal = inputCategory.value;
            const priceVal = parseFloat(inputPrice.value);
            const stockVal = parseInt(inputStock.value);

            if (!nameVal || !categoryVal || isNaN(priceVal) || priceVal < 0 || isNaN(stockVal) || stockVal < 0) {
                if (feedback) {
                    feedback.textContent = "Gagal! Nama atau harga/stok tidak valid. Periksa kembali input Anda.";
                    feedback.className = "feedback-msg error";
                }
                return;
            }

            if (idEditAktif !== null) {
                const prod = localProductList.find(p => p.id === idEditAktif);
                if (prod) {
                    prod.name = nameVal;
                    prod.category = categoryVal;
                    prod.price = priceVal;
                    prod.stock = stockVal;
                }
                if (feedback) {
                    feedback.textContent = `Sukses! Produk '${nameVal}' berhasil diperbarui.`;
                    feedback.className = "feedback-msg success";
                }
                idEditAktif = null;
                if (submitBtn) submitBtn.textContent = "Simpan Produk";
                if (batalBtn) batalBtn.style.display = 'none';
            } else {
                const newProduct = {
                    id: Date.now(),
                    name: nameVal,
                    category: categoryVal,
                    price: priceVal,
                    stock: stockVal,
                    active: true
                };
                localProductList.push(newProduct);
                
                console.log("Data produk berhasil disimpan ke Mock Data:", newProduct);
                console.log("Daftar seluruh produk saat ini:", localProductList);

                if (feedback) {
                    feedback.textContent = `Sukses! Produk '${newProduct.name}' berhasil tersimpan.`;
                    feedback.className = "feedback-msg success";
                }
            }

            simpanKeStorage();
            renderProducts();
            form.reset();
            previewName.textContent = '-';
            previewCategory.textContent = '-';
            previewPrice.textContent = '-';
            previewStock.textContent = '-';
        });
    }

    if (searchInput) searchInput.addEventListener('input', renderProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', renderProducts);
});

// ====================================================
// FUNGSI AKSI GLOBAL (Edit, Nonaktifkan, Hapus)
// ====================================================
window.handleEditProduct = (productId) => {
    const prod = localProductList.find(p => p.id === productId);
    if (prod) {
        document.getElementById('product-name').value = prod.name;
        document.getElementById('product-category').value = prod.category;
        document.getElementById('product-price').value = prod.price;
        document.getElementById('product-stock').value = prod.stock;

        document.getElementById('preview-name').textContent = prod.name;
        document.getElementById('preview-category').textContent = prod.category;
        document.getElementById('preview-price').textContent = formatRupiah(prod.price);
        document.getElementById('preview-stock').textContent = prod.stock;

        idEditAktif = prod.id;
        const submitBtn = document.querySelector('#product-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Simpan Perubahan";

        const batalBtn = document.getElementById('btn-cancel-edit');
        if (batalBtn) batalBtn.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.handleToggleStatus = (productId) => {
    const prod = localProductList.find(p => p.id === productId);
    if (prod) {
        prod.active = prod.active === false ? true : false;
        simpanKeStorage();
        renderProducts();
    }
};

window.handleDeleteProduct = (productId) => {
    const prod = localProductList.find(p => p.id === productId);
    const namaProd = prod ? prod.name : 'Produk';
    
    // Popup konfirmasi hapus
    const konfirmasi = window.confirm(`Yakin ingin menghapus produk "${namaProd}"?`);
    if (konfirmasi) {
        const index = localProductList.findIndex(p => p.id === productId);
        if (index !== -1) {
            const deletedItem = localProductList.splice(index, 1);
            console.log("Produk berhasil dihapus:", deletedItem);
            simpanKeStorage();
            renderProducts();
        }
    }
};