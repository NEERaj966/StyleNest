import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const getSizesText = (sizes) =>
  Array.isArray(sizes) && sizes.length > 0
    ? sizes.join(', ')
    : ''

const HeroSection = ({ showAdmin = false, adminPortal = false }) => {
  const [trand, setTrand] = useState([])
  const [form, setForm] = useState({
    name: '',
    price: '',
    quantity: '',
    category: 'Women',
    sizes: '',
  })

  const [editingId, setEditingId] = useState(null)

  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    quantity: '',
    category: 'Women',
    sizes: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const visibleProducts = useMemo(() => {
    const safeProducts = Array.isArray(trand) ? trand : []

    return safeProducts
      .slice()
      .sort(
        (a, b) =>
          Number(b?.rating ?? 0) - Number(a?.rating ?? 0),
      )
      .slice(0, 10)
  }, [trand])

  const totalAvailable = useMemo(
    () =>
      visibleProducts.reduce(
        (sum, item) => sum + Number(item.quantity ?? 0),
        0,
      ),
    [visibleProducts],
  )

  useEffect(() => {
    const fetchTrend = async () => {
      setIsLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('adminToken')

        const endpoint = adminPortal
          ? '/api/v1/foodcards/my'
          : '/api/v1/foodcards'

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}${endpoint}`,
          {
            headers: adminPortal
              ? {
                Authorization: `Bearer ${token}`,
              }
              : {},
          },
        )

        if (res.status === 200) {
          const data = res.data?.data

          if (Array.isArray(data)) {
            setTrand(data)
          } else if (Array.isArray(data?.foodcards)) {
            setTrand(data.foodcards)
          } else if (Array.isArray(data?.products)) {
            setTrand(data.products)
          } else if (Array.isArray(data?.items)) {
            setTrand(data.items)
          } else {
            console.error(
              'Expected an array but received:',
              data,
            )

            setTrand([])
          }
        }
      } catch (err) {
        console.log(err)

        setError(
          adminPortal
            ? 'Unable to load your products right now.'
            : 'Unable to load featured products right now.',
        )

        setTrand([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrend()
  }, [adminPortal])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const parseSizes = (value) =>
    value
      .split(',')
      .map((size) => size.trim())
      .filter(Boolean)

  const addItem = async (e) => {
    e.preventDefault()

    if (
      !form.name.trim() ||
      form.price === '' ||
      form.quantity === ''
    ) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards`,
        {
          name: form.name.trim(),
          price: Number(form.price),
          quantity: Number(form.quantity),
          category: form.category,
          sizes: parseSizes(form.sizes),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (res.status === 201 || res.status === 200) {
        const created = res.data?.data

        if (created) {
          setTrand((prev) => [created, ...prev])
        }

        setForm({
          name: '',
          price: '',
          quantity: '',
          category: form.category,
          sizes: '',
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')

      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (res.status === 200) {
        setTrand((prev) =>
          prev.filter((item) => item._id !== id),
        )
      }
    } catch (err) {
      console.log(err)
    }
  }

  const startEdit = (item) => {
    setEditingId(item._id)

    setEditForm({
      name: item.name,
      price: item.price,
      quantity: item.quantity ?? 0,
      category: item.category,
      sizes: getSizesText(item.sizes),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)

    setEditForm({
      name: '',
      price: '',
      quantity: '',
      category: 'Women',
      sizes: '',
    })
  }

  const saveEdit = async (id) => {
    if (
      !editForm.name.trim() ||
      editForm.price === '' ||
      editForm.quantity === ''
    ) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')

      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}`,
        {
          name: editForm.name.trim(),
          price: Number(editForm.price),
          quantity: Number(editForm.quantity),
          category: editForm.category,
          sizes: parseSizes(editForm.sizes),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (res.status === 200) {
        const updated = res.data?.data

        if (updated) {
          setTrand((prev) =>
            prev.map((item) =>
              item._id === id ? updated : item,
            ),
          )
        }

        cancelEdit()
      }
    } catch (err) {
      console.log(err)
    }
  }

  const renderField = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    min,
  }) => (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#746b61]">
        {label}
      </span>

      <input
        name={name}
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 text-sm text-[#24211d] outline-none transition placeholder:text-[#9b9186] focus:border-[#a94b2e] focus:bg-[#f8f4ec] focus:ring-4 focus:ring-[#f2e4dc]"
      />
    </label>
  )

  return (
    <section className="bg-[#eee8de] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div
          className={`grid gap-6 ${
            showAdmin
              ? 'xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start'
              : 'grid-cols-1'
          }`}
        >
          <div className="min-w-0 overflow-hidden rounded-[28px] border border-[#d5cec2] bg-[#f8f4ec] shadow-[0_18px_55px_rgba(36,33,29,0.08)]">
            <div className="grid gap-6 border-b border-[#d5cec2] px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a94b2e]">
                  StyleNest Edit
                </p>

                <h1 className="mt-3 max-w-3xl text-4xl font-normal leading-[0.95] tracking-[-0.03em] text-[#24211d] sm:text-5xl lg:text-6xl">
                  {adminPortal
                    ? 'Your live product shelf'
                    : 'Fresh pieces for every wardrobe'}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#746b61] sm:text-base">
                  {adminPortal
                    ? 'Review availability, pricing, sizes and quick edits from one focused panel.'
                    : 'Browse the newest arrivals curated across women, men and kids collections.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center sm:w-[360px]">
                <div className="rounded-xl border border-[#d5cec2] bg-[#eee8de] px-3 py-3">
                  <p className="text-lg font-bold text-[#24211d]">
                    {visibleProducts.length}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#877d72]">
                    Products
                  </p>
                </div>

                <div className="rounded-xl border border-[#d5cec2] bg-[#eee8de] px-3 py-3">
                  <p className="text-lg font-bold text-[#24211d]">
                    {totalAvailable}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#877d72]">
                    Units
                  </p>
                </div>

                <div className="rounded-xl border border-[#d5cec2] bg-[#eee8de] px-3 py-3">
                  <p className="text-lg font-bold text-[#24211d]">
                    {visibleProducts.filter((item) => item.isAvailable !== false).length}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#877d72]">
                    Active
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-5 mt-5 rounded-xl border border-[#d9b6a8] bg-[#f2e4dc] px-4 py-3 text-sm font-semibold text-[#8f3d25] sm:mx-8">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[430px] animate-pulse rounded-[22px] bg-[#e5ded3]"
                  />
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="px-5 py-16 text-center sm:px-8">
                <p className="text-sm font-bold text-[#24211d]">
                  No products found
                </p>
                <p className="mt-2 text-xs text-[#877d72]">
                  Add a product to start filling this collection.
                </p>
              </div>
            ) : (
              <div className="-mx-2 overflow-hidden px-5 py-6 sm:px-8">
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-3 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5">
                  {visibleProducts.map((item) => {
                    const itemId = item._id ?? item.id
                    const isEditing =
                      showAdmin && editingId === itemId
                    const image =
                      item.image ||
                      item.imageUrl ||
                      item.images?.[0] ||
                      ''
                    const quantity = Number(item.quantity ?? 0)
                    const isAvailable =
                      item.isAvailable !== false && quantity > 0

                    return (
                      <article
                        key={itemId}
                        onClick={() =>
                          navigate(
                            adminPortal
                              ? `/admin/product/${itemId}`
                              : `/product/${itemId}`,
                          )
                        }
                        className="group min-w-[280px] max-w-[280px] snap-start overflow-hidden rounded-[22px] border border-[#d5cec2] bg-[#f8f4ec] shadow-[0_10px_32px_rgba(36,33,29,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(36,33,29,0.11)] sm:min-w-[320px] sm:max-w-[320px] lg:min-w-[360px] lg:max-w-[360px]"
                      >
                        {isEditing ? (
                          <div
                            className="space-y-4 p-5"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {renderField({
                              label: 'Product name',
                              name: 'name',
                              value: editForm.name,
                              onChange: handleEditChange,
                            })}

                            <div className="grid grid-cols-2 gap-3">
                              {renderField({
                                label: 'Price',
                                name: 'price',
                                type: 'number',
                                value: editForm.price,
                                onChange: handleEditChange,
                              })}

                              {renderField({
                                label: 'Quantity',
                                name: 'quantity',
                                type: 'number',
                                min: '0',
                                value: editForm.quantity,
                                onChange: handleEditChange,
                              })}
                            </div>

                            <label className="block">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#746b61]">
                                Category
                              </span>

                              <select
                                name="category"
                                value={editForm.category}
                                onChange={handleEditChange}
                                className="mt-2 h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 text-sm text-[#24211d] outline-none transition focus:border-[#a94b2e] focus:bg-[#f8f4ec] focus:ring-4 focus:ring-[#f2e4dc]"
                              >
                                <option>Women</option>
                                <option>Men</option>
                                <option>Kids</option>
                                <option>Other</option>
                              </select>
                            </label>

                            {renderField({
                              label: 'Sizes',
                              name: 'sizes',
                              value: editForm.sizes,
                              onChange: handleEditChange,
                              placeholder: 'XS, S, M, L, XL',
                            })}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(itemId)}
                                className="h-11 rounded-xl bg-[#24211d] px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#f8f4ec] transition hover:bg-[#302b26]"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="h-11 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#5d554c] transition hover:bg-[#eee8de]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#e5ded3]">
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.name}
                                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-5xl text-[#9b9186]">
                                  +
                                </div>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-[#24211d]/55 via-transparent to-[#24211d]/10" />

                              <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
                                <span className="max-w-[55%] truncate rounded-full border border-[#f8f4ec]/40 bg-[#f8f4ec]/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#3e3730] backdrop-blur">
                                  {item.category || 'Other'}
                                </span>

                                <span
                                  className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] backdrop-blur ${
                                    isAvailable
                                      ? 'border-emerald-200 bg-emerald-50/95 text-emerald-700'
                                      : 'border-red-200 bg-red-50/95 text-red-600'
                                  }`}
                                >
                                  {isAvailable ? 'In stock' : 'Sold out'}
                                </span>
                              </div>

                              <div className="absolute bottom-4 left-4 right-4">
                                <p className="line-clamp-2 text-2xl font-semibold leading-tight text-[#f8f4ec]">
                                  {item.name}
                                </p>

                                <div className="mt-3 flex items-end justify-between gap-4">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#f8f4ec]/75">
                                      Selling price
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-[#f8f4ec]">
                                      Rs. {item.price}
                                    </p>
                                  </div>

                                  <div className="rounded-xl bg-[#f8f4ec]/90 px-3 py-2 text-right backdrop-blur">
                                    <p className="text-xs font-bold text-[#24211d]">
                                      {Number(item.rating ?? 0).toFixed(1)} star
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-[#746b61]">
                                      {quantity} left
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4 p-4">
                              {getSizesText(item.sizes) && (
                                <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#746b61]">
                                  Sizes: {getSizesText(item.sizes)}
                                </p>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="flex-1 rounded-xl border border-[#d9b6a8] bg-[#f2e4dc] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8f3d25] transition hover:bg-[#ead6cc]"
                                >
                                  View
                                </button>

                                {showAdmin && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        startEdit(item)
                                      }}
                                      className="rounded-xl border border-[#d5cec2] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5d554c] transition hover:bg-[#eee8de]"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        removeItem(itemId)
                                      }}
                                      className="rounded-xl border border-red-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-red-600 transition hover:bg-red-50"
                                    >
                                      Remove
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {showAdmin && (
            <aside className="rounded-[28px] border border-[#d5cec2] bg-[#f8f4ec] p-5 shadow-[0_18px_55px_rgba(36,33,29,0.08)] sm:p-6 xl:sticky xl:top-24">
              <div className="border-b border-[#d5cec2] pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a94b2e]">
                  Admin
                </p>

                <h2 className="mt-2 text-2xl font-normal tracking-[-0.02em] text-[#24211d]">
                  Add Product
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#877d72]">
                  Create a catalog item with stock, category and available sizes.
                </p>
              </div>

              <form className="mt-5 space-y-4" onSubmit={addItem}>
                {renderField({
                  label: 'Product name',
                  name: 'name',
                  value: form.name,
                  onChange: handleChange,
                  placeholder: 'Classic cotton shirt',
                })}

                <div className="grid grid-cols-2 gap-3">
                  {renderField({
                    label: 'Price',
                    name: 'price',
                    type: 'number',
                    value: form.price,
                    onChange: handleChange,
                    placeholder: '1299',
                  })}

                  {renderField({
                    label: 'Stock',
                    name: 'quantity',
                    type: 'number',
                    min: '0',
                    value: form.quantity,
                    onChange: handleChange,
                    placeholder: '20',
                  })}
                </div>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#746b61]">
                    Category
                  </span>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="mt-2 h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 text-sm text-[#24211d] outline-none transition focus:border-[#a94b2e] focus:bg-[#f8f4ec] focus:ring-4 focus:ring-[#f2e4dc]"
                  >
                    <option>Women</option>
                    <option>Men</option>
                    <option>Kids</option>
                    <option>Other</option>
                  </select>
                </label>

                {renderField({
                  label: 'Sizes',
                  name: 'sizes',
                  value: form.sizes,
                  onChange: handleChange,
                  placeholder: 'XS, S, M, L, XL',
                })}

                <button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-xl bg-[#24211d] text-xs font-bold uppercase tracking-[0.18em] text-[#f8f4ec] transition hover:bg-[#302b26]"
                >
                  Add Product
                </button>
              </form>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
