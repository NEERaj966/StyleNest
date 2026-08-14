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
    <section className="bg-gradient-to-b from-white via-amber-50/40 to-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">Suggested For You&apos;s</p>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
            Spotlight Today
          </span>
        </div>

        {isAdmin && (
          <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.07)]">

            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="
            flex h-11 w-11 items-center justify-center
            rounded-2xl
            bg-gradient-to-br from-amber-400 to-orange-500
            text-xl
            shadow-lg shadow-amber-200
          ">
                      🗃️
                    </div>

                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-slate-900">
                        Add New Item
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Create a new   item for your store
                      </p>
                    </div>
                  </div>
                </div>

                <span className="
        hidden rounded-full
        border border-amber-200
        bg-white
        px-3 py-1.5
        text-[11px]
        font-semibold
        text-amber-600
        shadow-sm
        sm:block
      ">
                  Admin Panel
                </span>
              </div>
            </div>


            {/* Form */}
            <form
              className="p-6"
              onSubmit={addItem}
            >

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {/* Food Name */}
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-semibold text-slate-600">
                    Product Name
                  </label>

                  <div className="relative">
                    <span className="
            pointer-events-none
            absolute left-4 top-1/2
            -translate-y-1/2
            text-base
          ">
                      📦
                    </span>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Classic Cotton T-Shirt"
                      className="
              h-12 w-full
              rounded-2xl
              border border-slate-200
              bg-slate-50/70
              pl-11 pr-4
              text-sm
              text-slate-800
              outline-none
              transition-all duration-200
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-amber-400
              focus:bg-white
              focus:ring-4
              focus:ring-amber-100/70
            "
                    />
                  </div>
                </div>


                {/* Price */}
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-semibold text-slate-600">
                    Price
                  </label>

                  <div className="relative">
                    <span className="
            pointer-events-none
            absolute left-4 top-1/2
            -translate-y-1/2
            text-sm font-bold
            text-amber-500
          ">
                      ₹
                    </span>

                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      className="
              h-12 w-full
              rounded-2xl
              border border-slate-200
              bg-slate-50/70
              pl-10 pr-4
              text-sm
              text-slate-800
              outline-none
              transition-all duration-200
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-amber-400
              focus:bg-white
              focus:ring-4
              focus:ring-amber-100/70
            "
                    />
                  </div>
                </div>


                {/* Quantity */}
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-semibold text-slate-600">
                    Available Quantity
                  </label>

                  <div className="relative">
                    <span className="
            pointer-events-none
            absolute left-4 top-1/2
            -translate-y-1/2
            text-base
          ">
                      🔢
                    </span>

                    <input
                      name="quantity"
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 25"
                      className="
              h-12 w-full
              rounded-2xl
              border border-slate-200
              bg-slate-50/70
              pl-11 pr-4
              text-sm
              text-slate-800
              outline-none
              transition-all duration-200
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-amber-400
              focus:bg-white
              focus:ring-4
              focus:ring-amber-100/70
            "
                    />
                  </div>
                </div>


                {/* Rating */}
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-semibold text-slate-600">
                    Rating
                  </label>

                  <div className="relative">
                    <span className="
            pointer-events-none
            absolute left-4 top-1/2
            -translate-y-1/2
            text-amber-400
          ">
                      ★
                    </span>

                    <input
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.rating}
                      onChange={handleChange}
                      placeholder="0.0 - 5.0"
                      className="
              h-12 w-full
              rounded-2xl
              border border-slate-200
              bg-slate-50/70
              pl-11 pr-4
              text-sm
              text-slate-800
              outline-none
              transition-all duration-200
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-amber-400
              focus:bg-white
              focus:ring-4
              focus:ring-amber-100/70
            "
                    />
                  </div>
                </div>


                {/* Category */}
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-semibold text-slate-600">
                    Category
                  </label>

                  <div className="relative">
                    <span className="
            pointer-events-none
            absolute left-4 top-1/2
            z-10
            -translate-y-1/2
            text-base
          ">
                      🏷️
                    </span>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="
              h-12 w-full
              appearance-none
              rounded-2xl
              border border-slate-200
              bg-slate-50/70
              pl-11 pr-10
              text-sm
              text-slate-700
              outline-none
              transition-all duration-200
              hover:border-slate-300
              focus:border-amber-400
              focus:bg-white
              focus:ring-4
              focus:ring-amber-100/70
            "
                    >
                      <option>Women</option>
                      <option>Men</option>
                      <option>Kids</option>
                      <option>Other</option>
                    </select>

                    <span className="
            pointer-events-none
            absolute right-4 top-1/2
            -translate-y-1/2
            text-xs text-slate-400
          ">
                      ▼
                    </span>
                  </div>
                </div>


                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-semibold text-slate-600">
                    Product Images
                  </label>

                  <label
                    className="
    flex h-12
    cursor-pointer
    items-center
    gap-3
    rounded-2xl
    border border-dashed
    border-slate-300
    bg-slate-50/70
    px-4
    transition-all duration-200
    hover:border-amber-400
    hover:bg-amber-50/50
  "
                  >
                    <span
                      className="
      flex h-8 w-8
      shrink-0
      items-center justify-center
      rounded-xl
      bg-white
      text-sm
      shadow-sm
    "
                    >
                      📷
                    </span>

                    <span className="truncate text-xs text-slate-500">
                      Upload product images
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Image Preview */}
                  {imageFiles?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {imageFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="
          relative
          aspect-square
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-slate-100
        "
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
                            className="
            absolute right-2 top-2
            flex h-7 w-7
            items-center justify-center
            rounded-full
            bg-black/70
            text-sm
            text-white
            transition
            hover:bg-red-500
          "
                          >
                            ×
                          </button>

                          <span
                            className="
            absolute bottom-2 left-2
            rounded-lg
            bg-black/60
            px-2 py-1
            text-[10px]
            font-medium
            text-white
          "
                          >
                            Image {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {/* Description */}
                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                  <div className="flex items-center justify-between">
                    <label className="ml-1 text-xs font-semibold text-slate-600">
                      📝 Description
                    </label>

                    <span className="text-[10px] text-slate-400">
                      Tell customers about this item
                    </span>
                  </div>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product, features, material, size, etc."
                    rows={4}
                    className="
            w-full
            resize-none
            rounded-2xl
            border border-slate-200
            bg-slate-50/70
            px-4 py-3
            text-sm
            leading-6
            text-slate-800
            outline-none
            transition-all duration-200
            placeholder:text-slate-400
            hover:border-slate-300
            focus:border-amber-400
            focus:bg-white
            focus:ring-4
            focus:ring-amber-100/70
          "
                  />
                </div>

              </div>


              {/* Bottom Action */}
              <div className="
      mt-6
      flex flex-col-reverse
      gap-3
      border-t border-slate-100
      pt-5
      sm:flex-row
      sm:items-center
      sm:justify-between
    ">

                <p className="text-[11px] text-slate-400">
                  Make sure all product details are correct before adding.
                </p>

                <button
                  type="submit"
                  className="
          group
          flex h-12
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-gradient-to-r
          from-amber-500
          to-orange-500
          px-7
          text-sm
          font-bold
          text-white
          shadow-lg
          shadow-amber-200/60
          transition-all duration-300
          hover:-translate-y-0.5
          hover:from-amber-600
          hover:to-orange-500
          hover:shadow-xl
          hover:shadow-amber-200
          active:translate-y-0
          active:scale-[0.98]
        "
                >
                  <span className="
          text-lg
          transition-transform duration-300
          group-hover:rotate-90
        ">
                    +
                  </span>

                  Add Item Card
                </button>

              </div>

            </form>
          </div>
        )}

        <div className="mt-8 grid justify-items-center gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {isLoading && <p className="text-sm text-slate-500 col-span-full">Loading...</p>}
          {error && <p className="text-sm text-rose-600 col-span-full">{error}</p>}
          {!isLoading && !error && items.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full">No Items yet.</p>
          )}
          {visibleItems.map((item) => {
            const itemId = item._id ?? item.id
            const isEditing = isAdmin && editingId === itemId
            const roundedRating = Math.max(0, Math.min(5, Math.round(item.rating || 0)))
            const itemQuantity = Number(item.quantity ?? 0)
            const inStock = item.isAvailable !== false && itemQuantity > 0
            const isFavorite = favoriteIds.includes(itemId)

            return (
              <div
                key={itemId}
                onClick={() =>
                  navigate(
                    adminMode
                      ? `/admin/product/${itemId}`
                      : `/product/${itemId}`
                  )
                }
                className="
        group relative w-full min-w-0 overflow-hidden
        rounded-2xl border border-slate-200/80
        bg-white
        shadow-[0_2px_10px_rgba(15,23,42,0.06)]
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_10px_30px_rgba(15,23,42,0.12)]
      "
              >
                {/* IMAGE */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                  <img
                    src={
                      typeof item?.imageUrl === 'string' && item.imageUrl.trim()
                        ? item.imageUrl.trim()
                        : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'
                    }
                    alt={item?.name || 'Product'}
                    className="
            h-full w-full object-cover
            transition-transform duration-500
            group-hover:scale-[1.04]
          "
                  />

                  {/* Soft image overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Rating badge */}
                  <div
                    className="
            absolute left-2.5 top-2.5
            flex items-center gap-1
            rounded-full
            bg-white/95
            px-2.5 py-1
            shadow-sm
            backdrop-blur-sm
          "
                  >
                    <span className="text-xs font-bold text-slate-700">
                      {(item.rating ?? 0).toFixed(1)}
                    </span>

                    <span className="text-[11px] text-emerald-600">
                      ★
                    </span>
                  </div>

                  {/* Favorite */}
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(itemId);
                        throttledFavoriteCard
                      }}
                      disabled={Boolean(favoriteUpdating[itemId])}
                      className="
              absolute right-2.5 top-2.5
              flex h-8 w-8 items-center justify-center
              rounded-full
              bg-white/95
              text-base
              text-slate-600
              shadow-sm
              backdrop-blur-sm
              transition-all
              hover:scale-105
              hover:bg-white
              hover:text-red-500
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
                      aria-label={
                        isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      {isFavorite ? '♥' : '♡'}
                    </button>
                  )}

                  {/* Category */}
                  <span
                    className="
            absolute bottom-2.5 left-2.5
            rounded-md
            bg-white/90
            px-2 py-1
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            text-slate-700
            backdrop-blur-sm
          "
                  >
                    {item.category || 'Special'}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-2.5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="
                w-full rounded-lg
                border border-slate-200
                bg-white px-3 py-2
                text-sm text-slate-800
                outline-none
                transition
                focus:border-amber-400
                focus:ring-2 focus:ring-amber-100
              "
                      />

                      <input
                        name="price"
                        type="number"
                        value={editForm.price}
                        onChange={handleEditChange}
                        className="
                w-full rounded-lg
                border border-slate-200
                bg-white px-3 py-2
                text-sm text-slate-800
                outline-none
                transition
                focus:border-amber-400
                focus:ring-2 focus:ring-amber-100
              "
                      />

                      <input
                        name="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editForm.rating}
                        onChange={handleEditChange}
                        className="
                w-full rounded-lg
                border border-slate-200
                bg-white px-3 py-2
                text-sm text-slate-800
                outline-none
                transition
                focus:border-amber-400
                focus:ring-2 focus:ring-amber-100
              "
                      />

                      <input
                        name="quantity"
                        type="number"
                        min="0"
                        value={editForm.quantity}
                        onChange={handleEditChange}
                        className="
                w-full rounded-lg
                border border-slate-200
                bg-white px-3 py-2
                text-sm text-slate-800
                outline-none
                transition
                focus:border-amber-400
                focus:ring-2 focus:ring-amber-100
              "
                      />

                      <select
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        className="
                w-full rounded-lg
                border border-slate-200
                bg-white px-3 py-2
                text-sm text-slate-800
                outline-none
                focus:border-amber-400
                focus:ring-2 focus:ring-amber-100
              "
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
                        className="
                w-full rounded-lg
                border border-slate-200
                bg-white px-3 py-2
                text-sm
              "
                      />

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(itemId)}
                          className="
                  flex-1 rounded-lg
                  bg-slate-900
                  px-3 py-2
                  text-xs font-semibold text-white
                  transition
                  hover:bg-slate-800
                "
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="
                  flex-1 rounded-lg
                  border border-slate-200
                  px-3 py-2
                  text-xs font-semibold text-slate-700
                  transition
                  hover:bg-slate-50
                "
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Product name */}
                      <div className="min-w-0">
                        <p
                          className="
                  truncate
                  text-[14px]
                  font-semibold
                  leading-5
                  text-slate-800
                "
                          title={item.name}
                        >
                          {item.name}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[13px] text-slate-400 line-through">
                          ₹{Math.round(Number(item.price || 0) * 1.8)}
                        </span>

                        <span className="text-[17px] font-bold text-slate-800">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Rating + stock */}
                      <div className="mt-1.5 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-700">
                            {Number(item.rating || 0).toFixed(1)}
                          </span>

                          <span className="text-[11px] text-amber-500">
                            ★
                          </span>

                          <span className="text-[10px] text-slate-400">
                            ({Number(item.reviewCount || 0)})
                          </span>
                        </div>

                        <span
                          className={`
                  rounded-full
                  px-2 py-0.5
                  text-[9px]
                  font-semibold
                  ${inStock
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                            }
                `}
                        >
                          {inStock ? `${itemQuantity} left` : 'Out of stock'}
                        </span>
                      </div>

                      {/* Admin */}
                      {isAdmin ? (
                        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(item);
                            }}
                            className="
                    flex-1 rounded-lg
                    border border-slate-200
                    px-3 py-1.5
                    text-[11px] font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item);
                            }}
                            className="
                    flex-1 rounded-lg
                    border border-rose-200
                    px-3 py-1.5
                    text-[11px] font-semibold
                    text-rose-600
                    transition
                    hover:bg-rose-50
                  "
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Star rating */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => submitRating(itemId, star)}
                                  disabled={Boolean(ratingSubmitting[itemId])}
                                  aria-label={`Rate ${item.name} ${star} star${star > 1 ? 's' : ''
                                    }`}
                                  className={`
                          text-base leading-none
                          transition
                          ${star <= roundedRating
                                      ? 'text-amber-500 hover:text-amber-600'
                                      : 'text-slate-200 hover:text-amber-400'
                                    }
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        `}
                                >
                                  ★
                                </button>
                              ))}
                            </div>

                            <span className="text-[9px] text-slate-400">
                              {ratingSubmitting[itemId]
                                ? 'Saving...'
                                : 'Rate'}
                            </span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CardSection