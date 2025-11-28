new Vue({
    el: '#stok-app',
    data: {
        // Data from dataBahanAjar.js
        upbjjList: dataBahanAjar.upbjjList,
        kategoriList: dataBahanAjar.kategoriList,
        stok: JSON.parse(JSON.stringify(dataBahanAjar.stok)), // Deep copy
        
        // Filter states
        filterUpbjj: '',
        filterKategori: '',
        filterLowStock: false,
        filterEmptyStock: false,
        sortBy: '',
        
        // Form states
        showAddForm: false,
        editingItem: null,
        newItem: {
            kode: '',
            judul: '',
            kategori: '',
            upbjj: '',
            lokasiRak: '',
            harga: 0,
            qty: 0,
            safety: 0,
            catatanHTML: ''
        },
        validationErrors: {}
    },
    
    computed: {
        // Dependent options - kategori yang tersedia berdasarkan UT yang dipilih
        availableKategori() {
            if (!this.filterUpbjj) return this.kategoriList;
            
            const kategoriSet = new Set();
            this.stok.forEach(item => {
                if (item.upbjj === this.filterUpbjj) {
                    kategoriSet.add(item.kategori);
                }
            });
            return Array.from(kategoriSet);
        },
        
        // Filtered and sorted stock
        filteredStok() {
            let result = this.stok;
            
            // Filter by UT Daerah
            if (this.filterUpbjj) {
                result = result.filter(item => item.upbjj === this.filterUpbjj);
            }
            
            // Filter by Kategori
            if (this.filterKategori) {
                result = result.filter(item => item.kategori === this.filterKategori);
            }
            
            // Filter low stock
            if (this.filterLowStock) {
                result = result.filter(item => item.qty < item.safety && item.qty > 0);
            }
            
            // Filter empty stock
            if (this.filterEmptyStock) {
                result = result.filter(item => item.qty === 0);
            }
            
            // Sorting
            if (this.sortBy) {
                result = [...result]; // Create new array for sorting
                
                switch(this.sortBy) {
                    case 'judul':
                        result.sort((a, b) => a.judul.localeCompare(b.judul));
                        break;
                    case 'judul-desc':
                        result.sort((a, b) => b.judul.localeCompare(a.judul));
                        break;
                    case 'qty':
                        result.sort((a, b) => a.qty - b.qty);
                        break;
                    case 'qty-desc':
                        result.sort((a, b) => b.qty - a.qty);
                        break;
                    case 'harga':
                        result.sort((a, b) => a.harga - b.harga);
                        break;
                    case 'harga-desc':
                        result.sort((a, b) => b.harga - a.harga);
                        break;
                }
            }
            
            return result;
        },
        
        // Statistics
        lowStockCount() {
            return this.stok.filter(item => item.qty < item.safety && item.qty > 0).length;
        },
        
        emptyStockCount() {
            return this.stok.filter(item => item.qty === 0).length;
        }
    },
    
    watch: {
        // Watcher 1: Monitor filter changes
        filterUpbjj(newVal, oldVal) {
            console.log(`Filter UT Daerah berubah dari "${oldVal}" ke "${newVal}"`);
            // Reset kategori filter when UT changes
            if (newVal !== oldVal) {
                this.filterKategori = '';
            }
        },
        
        // Watcher 2: Monitor stock quantity changes
        stok: {
            handler(newStok) {
                newStok.forEach(item => {
                    if (item.qty === 0) {
                        console.log(`⚠️ ALERT: Stok ${item.kode} - ${item.judul} KOSONG!`);
                    } else if (item.qty < item.safety) {
                        console.log(`⚠️ WARNING: Stok ${item.kode} - ${item.judul} menipis (${item.qty}/${item.safety})`);
                    }
                });
            },
            deep: true
        }
    },
    
    methods: {
        // Filter methods
        resetFilters() {
            this.filterUpbjj = '';
            this.filterKategori = '';
            this.filterLowStock = false;
            this.filterEmptyStock = false;
            this.sortBy = '';
        },
        
        onUpbjjChange() {
            // This method is called when UT Daerah filter changes
            // Kategori filter will be automatically reset by watcher
        },
        
        // Edit methods
        editItem(item) {
            this.editingItem = JSON.parse(JSON.stringify(item)); // Deep copy
        },
        
        saveEdit() {
            const index = this.stok.findIndex(item => item.kode === this.editingItem.kode);
            if (index !== -1) {
                this.$set(this.stok, index, this.editingItem);
                this.editingItem = null;
                alert('Data berhasil diupdate!');
            }
        },
        
        cancelEdit() {
            this.editingItem = null;
        },
        
        // Add new item methods
        validateNewItem() {
            this.validationErrors = {};
            
            // Check if kode already exists
            if (this.stok.find(item => item.kode === this.newItem.kode)) {
                this.validationErrors.kode = 'Kode mata kuliah sudah ada';
            }
            
            // Validate kode format
            if (!/^[A-Z]{4}\d{4}$/.test(this.newItem.kode)) {
                this.validationErrors.kode = 'Format kode harus 4 huruf kapital + 4 angka (contoh: EKMA4116)';
            }
            
            // Validate judul
            if (this.newItem.judul.length < 5) {
                this.validationErrors.judul = 'Nama mata kuliah minimal 5 karakter';
            }
            
            return Object.keys(this.validationErrors).length === 0;
        },
        
        addNewItem() {
            if (!this.validateNewItem()) {
                return;
            }
            
            this.stok.push({...this.newItem});
            this.showAddForm = false;
            this.resetNewItem();
            alert('Data berhasil ditambahkan!');
        },
        
        cancelAdd() {
            this.showAddForm = false;
            this.resetNewItem();
        },
        
        resetNewItem() {
            this.newItem = {
                kode: '',
                judul: '',
                kategori: '',
                upbjj: '',
                lokasiRak: '',
                harga: 0,
                qty: 0,
                safety: 0,
                catatanHTML: ''
            };
            this.validationErrors = {};
        },
        
        // Helper methods
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
        
        getRowClass(item) {
            if (item.qty === 0) return 'row-danger';
            if (item.qty < item.safety) return 'row-warning';
            return '';
        }
    }
});
