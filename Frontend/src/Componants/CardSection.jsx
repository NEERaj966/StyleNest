import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AdminDataContext } from '../Context/AdminDataContext.js'
import { OrderDataContext } from '../Context/OrderDataContext.js'
import { useNavigate } from 'react-router-dom'
import useThrottle from "../hooks/useThrottle";


const CardSection = ({ title = 'Popular Picks', adminMode = false, limitTopRated = null }) => {
  const { Admin } = useContext(AdminDataContext)
  const { addToCart } = useContext(OrderDataContext)
  const isAdmin = adminMode && Admin
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    price: '',
    quantity: '',
    rating: 4.5,
    category: 'Women',
    sizes: '',
    description: '',
  })
  const [imageFiles, setImageFiles] = useState([]);
  const [editingId, setEditingId] = useState([])
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    quantity: '',
    rating: 4.5,
    category: 'Women',
  })
  const [editImageFile, setEditImageFile] = useState(null)
  const [ratingSubmitting, setRatingSubmitting] = useState({})
  const [favoriteIds, setFavoriteIds] = useState([])
  const [favoriteUpdating, setFavoriteUpdating] = useState({})

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('adminToken')
        const endpoint = adminMode ? '/api/v1/foodcards/my' : '/api/v1/foodcards'
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
          headers: adminMode
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {},
        })

        if (res.status === 200) {
          // The API returns the products inside data.items:
          // { data: { items: [...], pagination: {...} } }
          // Keep items as an array because the card grid uses .map().
          const responseData = res.data?.data

          const fetchedItems = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.items)
              ? responseData.items
              : Array.isArray(responseData?.foodcards)
                ? responseData.foodcards
                : Array.isArray(responseData?.products)
                  ? responseData.products
                  : Array.isArray(res.data?.items)
                    ? res.data.items
                    : []

          setItems(fetchedItems)
        }
      } catch (err) {
        console.log(err)
        setError(adminMode ? 'Unable to load your food cards.' : 'Unable to load food cards.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [adminMode])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (adminMode) return
      const token = localStorage.getItem('token')
      if (!token) {
        setFavoriteIds([])
        return
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/users/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 200) {
          const favorites = res.data?.data ?? []
          setFavoriteIds(favorites.map((fav) => fav._id || fav.id))
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchFavorites()
  }, [adminMode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files || []);

    setImageFiles((prev) => {
      const combined = [...prev, ...newFiles];

      if (combined.length > 2) {
        alert("You can select maximum 2 images");
        return prev;
      }

      return combined;
    });

    e.target.value = "";
  };

  const handleEditImageChange = (e) => {
    const newFiles = Array.from(e.target.files || []);

    if (newFiles.length > 2) {
      alert("You can upload maximum 2 images.");
      return;
    }

    setEditImageFile(newFiles || null)
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.price === '' || form.quantity === '') return

    try {
      const token = localStorage.getItem('adminToken')
      const payload = new FormData()
      payload.append('name', form.name.trim())
      payload.append('price', Number(form.price))
      payload.append('quantity', Number(form.quantity))
      payload.append('rating', Number(form.rating))
      payload.append('category', form.category)
      payload.append('sizes', form.sizes)
      payload.append('description', form.description.trim())
      imageFiles.forEach((file) => {
        payload.append("images", file);
      });

      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/foodcards`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 201 || res.status === 200) {
        const created = res.data?.data
        if (created) {
          setItems((prev) => [created, ...prev])
        }
        setForm({
          name: '',
          price: '',
          quantity: '',
          rating: 4.5,
          category: form.category,
          sizes: '',
          description: '',
        })
        setImageFile(null)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const startEdit = (item) => {
    const productId = item?._id || item?.id;

    if (!productId) {
      console.error("Product ID not found:", item);
      return;
    }

    navigate(`/admin/edit-product/${productId}`);
    setEditImageFile(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', price: '', quantity: '', rating: 4.5, category: 'Women' })
    setEditImageFile(null)
  }

  const saveEdit = async (id) => {
    if (!editForm.name.trim() || editForm.price === '' || editForm.quantity === '') return

    try {
      const token = localStorage.getItem('adminToken')
      const payload = new FormData()
      payload.append('name', editForm.name.trim())
      payload.append('price', Number(editForm.price))
      payload.append('quantity', Number(editForm.quantity))
      payload.append('rating', Number(editForm.rating))
      payload.append('category', editForm.category)
      editImageFiles.forEach((file) => {
        payload.append("images", file);
      });

      const res = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 200) {
        const updated = res.data?.data
        if (updated) {
          setItems((prev) => prev.map((item) => (item._id === id ? updated : item)))
        }
        cancelEdit()
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleDelete = async (product) => {
    const productId = product?._id || product?.id;

    if (!productId) {
      console.error("Product ID not found:", product);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product?.name}"?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove product immediately from UI
      setProducts((previousProducts) =>
        previousProducts.filter(
          (item) => (item?._id || item?.id) !== productId
        )
      );

      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Delete product error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete product"
      );
    }
  };

  const submitRating = async (id, ratingValue) => {
    const numericRating = Number(ratingValue)
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) return
    setRatingSubmitting((prev) => ({ ...prev, [id]: true }))

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        setRatingSubmitting((prev) => ({ ...prev, [id]: false }))
        return
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}/reviews`,
        { rating: numericRating, comment: '' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (res.status === 200) {
        const updated = res.data?.data
        if (updated) {
          setItems((prev) =>
            prev.map((item) =>
              (item._id || item.id) === id
                ? { ...item, rating: updated.rating, reviewCount: updated.reviewCount }
                : item,
            ),
          )
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      setRatingSubmitting((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleOrderNow = (item) => {
    addToCart(item)
    navigate('/orders')
  }

  const toggleFavorite = async (itemId) => {
    if (!itemId) return
    if (adminMode) return

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const isFav = favoriteIds.includes(itemId)
    setFavoriteUpdating((prev) => ({ ...prev, [itemId]: true }))


    try {
      const url = `${import.meta.env.VITE_BASE_URL}/api/v1/users/favorites/${itemId}`
      const res = isFav
        ? await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } })

      if (res.status === 200) {
        const favorites = res.data?.data ?? []
        setFavoriteIds(favorites.map((fav) => fav._id || fav.id))
      }
    } catch (err) {
      console.log(err)
    } finally {
      setFavoriteUpdating((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const throttledFavoriteCard = useThrottle(
    toggleFavorite,
    700
);

  const removeItem = async (item) => {
    const productId = item?._id || item?.id;

    if (!productId) {
      console.error("Product ID not found:", product);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${productId?.name}"?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove product immediately from UI
      setProducts((previousProducts) =>
        previousProducts.filter(
          (item) => (item?._id || item?.id) !== productId
        )
      );

      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Delete product error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete product"
      );
    }
  };

  const visibleItems = React.useMemo(() => {
    const safeItems = Array.isArray(items) ? items : []

    if (isAdmin || !limitTopRated) {
      return safeItems
    }

    return safeItems
      .slice()
      .sort(
        (a, b) =>
          Number(b?.rating ?? 0) - Number(a?.rating ?? 0)
      )
      .slice(0, Number(limitTopRated))
  }, [isAdmin, items, limitTopRated])

  return (
    <section className="min-h-screen bg-[#f3eee5] py-10 text-[#24211d] sm:py-14">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Editorial section header */}
        <div className="flex flex-col gap-5 border-b border-[#c9c0b4] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-[#a94b2e]">
              The Atelier / Selection
            </p>

            <h2
              className="mt-2 text-4xl font-normal leading-[0.95] tracking-[-0.045em] text-[#24211d] sm:text-5xl lg:text-6xl"
              style={{
                fontFamily:
                  'Didot, "Bodoni MT", "Times New Roman", Georgia, serif',
              }}
            >
              {title}
            </h2>

            <p className="mt-3 max-w-xl text-[9px] leading-5 text-[#746b61]">
              A considered edit of pieces selected for the season.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[8px] uppercase tracking-[0.18em] text-[#746b61]">
              {visibleItems.length} pieces
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-[#a94b2e]" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
              {isAdmin ? "Admin Collection" : "Spotlight"}
            </span>
          </div>
        </div>

        {/* Admin create panel */}
        {isAdmin && (
          <div className="mt-7 overflow-hidden rounded-[16px] border border-[#c9c0b4] bg-[#f8f4ec] shadow-[0_10px_32px_rgba(36,33,29,0.055)]">
            <div className="border-b border-[#d5cec2] px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-[#a94b2e]">
                    Catalogue / New Entry
                  </p>
                  <h3
                    className="mt-1 text-2xl font-normal tracking-[-0.03em]"
                    style={{
                      fontFamily:
                        'Didot, "Bodoni MT", "Times New Roman", Georgia, serif',
                    }}
                  >
                    Add New Item
                  </h3>
                </div>

                <span className="w-fit border border-[#c9c0b4] px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.18em] text-[#746b61]">
                  Admin Panel
                </span>
              </div>
            </div>

            <form className="p-6 sm:p-8" onSubmit={addItem}>
              <div className="grid gap-x-5 gap-y-6 md:grid-cols-2 xl:grid-cols-3">

                <div className="space-y-2">
                  <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                    Product Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Classic Cotton T-Shirt"
                    className="h-11 w-full rounded-[9px] border border-[#c9c0b4] bg-[#f3eee5] px-4 text-[10px] text-[#24211d] outline-none placeholder:text-[#9b9186] transition focus:border-[#a94b2e] focus:bg-[#f8f4ec]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                    Price
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#a94b2e]">
                      ₹
                    </span>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      className="h-11 w-full rounded-[9px] border border-[#c9c0b4] bg-[#f3eee5] pl-9 pr-4 text-[10px] text-[#24211d] outline-none placeholder:text-[#9b9186] transition focus:border-[#a94b2e] focus:bg-[#f8f4ec]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                    Available Quantity
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                    className="h-11 w-full rounded-[9px] border border-[#c9c0b4] bg-[#f3eee5] px-4 text-[10px] text-[#24211d] outline-none placeholder:text-[#9b9186] transition focus:border-[#a94b2e] focus:bg-[#f8f4ec]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                    Rating
                  </label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="0.0 - 5.0"
                    className="h-11 w-full rounded-[9px] border border-[#c9c0b4] bg-[#f3eee5] px-4 text-[10px] text-[#24211d] outline-none placeholder:text-[#9b9186] transition focus:border-[#a94b2e] focus:bg-[#f8f4ec]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="h-11 w-full rounded-[9px] border border-[#c9c0b4] bg-[#f3eee5] px-4 text-[10px] text-[#24211d] outline-none transition focus:border-[#a94b2e] focus:bg-[#f8f4ec]"
                  >
                    <option>Women</option>
                    <option>Men</option>
                    <option>Kids</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                    Sizes
                  </label>
                  <input
                    name="sizes"
                    value={form.sizes}
                    onChange={handleChange}
                    placeholder="XS, S, M, L, XL, XXL"
                    className="h-11 w-full rounded-[9px] border border-[#c9c0b4] bg-[#f3eee5] px-4 text-[10px] text-[#24211d] outline-none placeholder:text-[#9b9186] transition focus:border-[#a94b2e] focus:bg-[#f8f4ec]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                    Product Images
                  </label>
                  <label className="flex h-11 cursor-pointer items-center justify-between rounded-[9px] border border-dashed border-[#b9afa2] bg-[#f3eee5] px-4 transition hover:border-[#a94b2e]">
                    <span className="text-[9px] text-[#746b61]">
                      Upload up to 2 images
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#a94b2e]">
                      Browse
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imageFiles?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {imageFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="relative aspect-square overflow-hidden rounded-[9px] border border-[#c9c0b4] bg-[#e5ded3]"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Product ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setImageFiles((current) =>
                                current.filter((_, i) => i !== index)
                              );
                            }}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#24211d]/85 text-sm text-[#f8f4ec] transition hover:bg-[#a94b2e]"
                          >
                            ×
                          </button>
                          <span className="absolute bottom-2 left-2 rounded-[5px] bg-[#24211d]/80 px-2 py-1 text-[7px] uppercase tracking-[0.12em] text-[#f8f4ec]">
                            Image {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#3e3730]">
                      Description
                    </label>
                    <span className="hidden text-[7px] uppercase tracking-[0.14em] text-[#9b9186] sm:block">
                      Tell customers about this piece
                    </span>
                  </div>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product, features, material, size, etc."
                    rows={4}
                    className="w-full resize-none rounded-[9px] border border-[#c9c0b4] bg-[#f3eee5] px-4 py-3 text-[10px] leading-6 text-[#24211d] outline-none placeholder:text-[#9b9186] transition focus:border-[#a94b2e] focus:bg-[#f8f4ec]"
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-4 border-t border-[#d5cec2] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[8px] leading-5 text-[#877d72]">
                  Review the product details before adding it to the catalogue.
                </p>

                <button
                  type="submit"
                  className="h-11 rounded-[9px] bg-[#a94b2e] px-7 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#f8f4ec] transition hover:bg-[#8f3d25] active:scale-[0.99]"
                >
                  Add Item Card
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading / error */}
        {isLoading && (
          <div className="py-16 text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#746b61]">
              Loading collection
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 border border-[#d9b6a8] bg-[#f2e4dc] px-5 py-4 text-[9px] text-[#8f3d25]">
            {error}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="mt-8 border border-dashed border-[#c9c0b4] bg-[#f8f4ec] px-6 py-16 text-center">
            <p
              className="text-3xl"
              style={{
                fontFamily:
                  'Didot, "Bodoni MT", "Times New Roman", Georgia, serif',
              }}
            >
              No pieces yet.
            </p>
            <p className="mt-2 text-[8px] uppercase tracking-[0.16em] text-[#877d72]">
              The collection is waiting for its next addition.
            </p>
          </div>
        )}

        {/* Product grid */}
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {visibleItems.map((item) => {
            const itemId = item._id ?? item.id
            const isEditing = isAdmin && editingId === itemId
            const roundedRating = Math.max(
              0,
              Math.min(5, Math.round(item.rating || 0))
            )
            const itemQuantity = Number(item.quantity ?? 0)
            const inStock = item.isAvailable !== false && itemQuantity > 0
            const isFavorite = favoriteIds.includes(itemId)

            return (
              <article
                key={itemId}
                onClick={() =>
                  navigate(
                    adminMode
                      ? `/admin/product/${itemId}`
                      : `/product/${itemId}`
                  )
                }
                className="group min-w-0 cursor-pointer"
              >
                {/* Product image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] border border-[#d5cec2] bg-[#e5ded3]">
                  <img
                    src={
                      typeof item?.imageUrl === 'string' &&
                      item.imageUrl.trim()
                        ? item.imageUrl.trim()
                        : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'
                    }
                    alt={item?.name || 'Product'}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#24211d]/20 to-transparent" />

                  <div className="absolute left-3 top-3 border border-[#d5cec2]/80 bg-[#f8f4ec]/90 px-2 py-1 backdrop-blur-sm">
                    <span className="text-[8px] font-semibold text-[#3e3730]">
                      {Number(item.rating ?? 0).toFixed(1)}
                    </span>
                    <span className="ml-1 text-[8px] text-[#a94b2e]">★</span>
                  </div>

                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(itemId)
                        throttledFavoriteCard
                      }}
                      disabled={Boolean(favoriteUpdating[itemId])}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#d5cec2]/80 bg-[#f8f4ec]/90 text-base text-[#4a433b] backdrop-blur-sm transition hover:text-[#a94b2e] disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={
                        isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      {isFavorite ? '♥' : '♡'}
                    </button>
                  )}

                  <span className="absolute bottom-3 left-3 bg-[#f8f4ec]/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.16em] text-[#3e3730] backdrop-blur-sm">
                    {item.category || 'Special'}
                  </span>
                </div>

                {/* Product information */}
                <div className="px-1 pt-3">
                  {isEditing ? (
                    <div
                      className="space-y-2 rounded-[12px] border border-[#c9c0b4] bg-[#f8f4ec] p-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full rounded-[8px] border border-[#c9c0b4] bg-[#f3eee5] px-3 py-2 text-[9px] text-[#24211d] outline-none focus:border-[#a94b2e]"
                      />
                      <input
                        name="price"
                        type="number"
                        value={editForm.price}
                        onChange={handleEditChange}
                        className="w-full rounded-[8px] border border-[#c9c0b4] bg-[#f3eee5] px-3 py-2 text-[9px] text-[#24211d] outline-none focus:border-[#a94b2e]"
                      />
                      <input
                        name="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editForm.rating}
                        onChange={handleEditChange}
                        className="w-full rounded-[8px] border border-[#c9c0b4] bg-[#f3eee5] px-3 py-2 text-[9px] text-[#24211d] outline-none focus:border-[#a94b2e]"
                      />
                      <input
                        name="quantity"
                        type="number"
                        min="0"
                        value={editForm.quantity}
                        onChange={handleEditChange}
                        className="w-full rounded-[8px] border border-[#c9c0b4] bg-[#f3eee5] px-3 py-2 text-[9px] text-[#24211d] outline-none focus:border-[#a94b2e]"
                      />
                      <select
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        className="w-full rounded-[8px] border border-[#c9c0b4] bg-[#f3eee5] px-3 py-2 text-[9px] text-[#24211d] outline-none focus:border-[#a94b2e]"
                      >
                        <option>Women</option>
                        <option>Men</option>
                        <option>Kids</option>
                        <option>Other</option>
                      </select>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="w-full rounded-[8px] border border-[#c9c0b4] bg-[#f3eee5] px-3 py-2 text-[9px]"
                      />

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(itemId)}
                          className="flex-1 rounded-[8px] bg-[#24211d] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#f8f4ec] transition hover:bg-[#3e3730]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 rounded-[8px] border border-[#c9c0b4] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#3e3730] transition hover:bg-[#eee8de]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className="min-w-0 truncate text-[12px] font-medium leading-5 text-[#302b26]"
                          title={item.name}
                        >
                          {item.name}
                        </p>

                        <span className="shrink-0 text-[7px] uppercase tracking-[0.12em] text-[#877d72]">
                          {inStock ? "Available" : "Sold out"}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[9px] text-[#9b9186] line-through">
                          ₹{Math.round(Number(item.price || 0) * 1.8)}
                        </span>
                        <span className="text-[13px] font-semibold text-[#24211d]">
                          ₹{item.price}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-[#d5cec2] pt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-[#a94b2e]">★</span>
                          <span className="text-[8px] font-semibold text-[#4a433b]">
                            {Number(item.rating || 0).toFixed(1)}
                          </span>
                          <span className="text-[7px] text-[#9b9186]">
                            ({Number(item.reviewCount || 0)})
                          </span>
                        </div>

                        <span
                          className={`text-[7px] font-semibold uppercase tracking-[0.12em] ${
                            inStock ? "text-[#6c786d]" : "text-[#a94b2e]"
                          }`}
                        >
                          {inStock ? `${itemQuantity} left` : "Out of stock"}
                        </span>
                      </div>

                      {Array.isArray(item.sizes) && item.sizes.length > 0 && (
                        <p className="mt-2 truncate text-[7px] uppercase tracking-[0.12em] text-[#746b61]">
                          Sizes: {item.sizes.join(", ")}
                        </p>
                      )}

                      {isAdmin ? (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEdit(item)
                            }}
                            className="flex-1 rounded-[8px] border border-[#c9c0b4] px-3 py-2 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#3e3730] transition hover:bg-[#eee8de]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeItem(item)
                            }}
                            className="flex-1 rounded-[8px] border border-[#d9b6a8] px-3 py-2 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#8f3d25] transition hover:bg-[#f2e4dc]"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  submitRating(itemId, star)
                                }}
                                disabled={Boolean(ratingSubmitting[itemId])}
                                aria-label={`Rate ${item.name} ${star} star${
                                  star > 1 ? 's' : ''
                                }`}
                                className={`text-[12px] leading-none transition ${
                                  star <= roundedRating
                                    ? 'text-[#a94b2e]'
                                    : 'text-[#d5cec2] hover:text-[#a94b2e]'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <span className="text-[7px] uppercase tracking-[0.12em] text-[#877d72]">
                            {ratingSubmitting[itemId] ? 'Saving...' : 'Rate'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* Editorial footer note */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[#c9c0b4] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[7px] uppercase tracking-[0.2em] text-[#877d72]">
            Aurora / Atelier · Considered pieces for everyday elegance
          </p>
          <span className="text-[7px] uppercase tracking-[0.2em] text-[#a94b2e]">
            {isAdmin ? "Catalogue Management" : "Curated Collection"}
          </span>
        </div>
      </div>
    </section>
  )
}



export default CardSection
