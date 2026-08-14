import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const HeroSection = ({ showAdmin = false, adminPortal = false }) => {
  const [trand, setTrand] = useState([])
  const [form, setForm] = useState({
    name: '',
    price: '',
    quantity: '',
    category: 'Women',
  })

  const [editingId, setEditingId] = useState(null)

  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    quantity: '',
    category: 'Women',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
          /*
           * FIX:
           * Make sure trand always receives an array.
           *
           * If backend returns:
           * data: [...]
           * it uses data directly.
           *
           * Otherwise it uses an empty array.
           */
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
            ? 'Unable to load your product right now.'
            : 'Unable to load trending items right now.',
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
        /*
         * FIX:
         * setMenu did not exist.
         * Your state setter is setTrand.
         */
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
    })
  }

  const cancelEdit = () => {
    setEditingId(null)

    setEditForm({
      name: '',
      price: '',
      quantity: '',
      category: 'Women',
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

  return (
    <section>
      <div
        className={`grid gap-6 ${showAdmin
          ? 'lg:grid-cols-[1.1fr_0.85fr] lg:items-start'
          : 'grid-cols-1'
          }`}
      >
        <div className="w-full p-10">
          {/* Section Header */}
          <div className="mb-9 flex items-end justify-between px-1">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">🔥</span>

                <span className="text-sm font-bold uppercase tracking-wide text-orange-500">
                  Trending Now
                </span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Trending Products
              </h2>

              <p className="mt-1 text-base text-slate-500 sm:text-lg">
                Discover what everyone is shopping right now.
              </p>
            </div>

            <div className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 shadow-sm sm:block">
              Scroll →
            </div>
          </div>

          {/* Horizontal Product Slider */}
          <div className="relative -mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6">
            <div
              className="
                flex
                gap-4
                overflow-x-auto
                pb-7
                snap-x
                snap-mandatory
                scroll-smooth
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                sm:gap-5
                lg:gap-6
              "
            >
              {trand.map((item) => {
                const itemId = item._id ?? item.id
                const isEditing =
                  showAdmin && editingId === itemId

                return (
                  <div
                    key={itemId}
                    onClick={() =>
                      navigate(
                        adminPortal
                          ? `/admin/product/${itemId}`
                          : `/product/${itemId}`
                      )
                    }
                    className="
                      group
                      relative
                      min-w-[300px]
                      max-w-[300px]
                      snap-start
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-slate-100
                      bg-white
                      shadow-[0_8px_30px_rgba(15,23,42,0.08)]
                      transition-all
                      duration-500
                      hover:-translate-y-1
                      hover:shadow-[0_18px_45px_rgba(15,23,42,0.14)]
                      sm:min-w-[330px]
                      sm:max-w-[330px]
                      lg:min-w-[350px]
                      lg:max-w-[350px]
                    "
                  >
                    {isEditing ? (
                      <div className="space-y-4 p-6">
                        <div>
                          <label className="text-xs font-semibold text-slate-600">
                            Item name
                          </label>

                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="
                              mt-1
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                              px-4
                              py-3
                              text-sm
                              outline-none
                              transition
                              focus:border-amber-400
                              focus:bg-white
                              focus:ring-2
                              focus:ring-amber-100
                            "
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600">
                            Price (₹)
                          </label>

                          <input
                            name="price"
                            type="number"
                            value={editForm.price}
                            onChange={handleEditChange}
                            className="
                              mt-1
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                              px-4
                              py-3
                              text-sm
                              outline-none
                              transition
                              focus:border-amber-400
                              focus:bg-white
                              focus:ring-2
                              focus:ring-amber-100
                            "
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600">
                            Category
                          </label>

                          <select
                            name="category"
                            value={editForm.category}
                            onChange={handleEditChange}
                            className="
                              mt-1
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                              px-4
                              py-3
                              text-sm
                              outline-none
                              transition
                              focus:border-amber-400
                              focus:bg-white
                              focus:ring-2
                              focus:ring-amber-100
                            "
                          >
                            <option>Women</option>
                            <option>Men</option>
                            <option>Kids</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600">
                            Quantity
                          </label>

                          <input
                            name="quantity"
                            type="number"
                            min="0"
                            value={editForm.quantity}
                            onChange={handleEditChange}
                            className="
                              mt-1
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                              px-4
                              py-3
                              text-sm
                              outline-none
                              transition
                              focus:border-amber-400
                              focus:bg-white
                              focus:ring-2
                              focus:ring-amber-100
                            "
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(itemId)}
                            className="
                              flex-1
                              rounded-full
                              bg-slate-900
                              px-4
                              py-3
                              text-xs
                              font-semibold
                              text-white
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
                              flex-1
                              rounded-full
                              border
                              border-slate-200
                              bg-white
                              px-4
                              py-3
                              text-xs
                              font-semibold
                              text-slate-700
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
                        {/* LARGE PRODUCT IMAGE */}
                        <div className="relative h-[430px] w-full overflow-hidden bg-slate-100">
                          <img
                            src={
                              item.image ||
                              item.imageUrl ||
                              item.images?.[0] ||
                              null
                            }
                            alt={item.name}
                            className="
                              absolute
                              inset-0
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-700
                              ease-out
                              group-hover:scale-[1.04]
                            "
                          />

                          {/* LEFT WHITE GRADIENT */}
                          <div
                            className="
                              pointer-events-none
                              absolute
                              inset-0
                              bg-gradient-to-r
                              from-white
                              via-white/75
                              to-transparent
                            "
                          />

                          {/* BOTTOM WHITE GRADIENT */}
                          <div
                            className="
                              pointer-events-none
                              absolute
                              inset-x-0
                              bottom-0
                              h-[65%]
                              bg-gradient-to-t
                              from-white
                              via-white/85
                              to-transparent
                            "
                          />

                          {/* CATEGORY */}
                          <div className="absolute left-6 top-7">
                            <span
                              className="
                                inline-flex
                                rounded-full
                                bg-white/90
                                px-4
                                py-2
                                text-[11px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-800
                                shadow-sm
                                backdrop-blur-sm
                              "
                            >
                              {item.category || 'Other'}
                            </span>
                          </div>

                          {/* TRENDING BADGE */}
                          <div
                            className="
                              absolute
                              right-6
                              top-7
                              rounded-full
                              bg-slate-900/90
                              px-4
                              py-2
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wide
                              text-white
                              shadow-sm
                              backdrop-blur-sm
                            "
                          >
                            Trending
                          </div>

                          {/* RATING */}
                          <div
                            className="
                              absolute
                              bottom-7
                              right-6
                              flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-white/95
                              px-3
                              py-2
                              shadow-md
                              backdrop-blur-sm
                            "
                          >
                            <span className="text-sm text-amber-500">
                              ★
                            </span>

                            <span className="text-xs font-bold text-slate-900">
                              {Number(item.rating ?? 0).toFixed(1)}
                            </span>
                          </div>

                          {/* PRODUCT INFORMATION */}
                          <div
                            className="
                              absolute
                              inset-x-0
                              bottom-0
                              z-10
                              p-6
                              sm:p-7
                            "
                          >
                            {/* NAME + CATEGORY */}
                            <div className="max-w-[68%]">
                              <p
                                className="
                                  text-[25px]
                                  font-extrabold
                                  leading-[1.15]
                                  tracking-tight
                                  text-slate-900
                                  sm:text-[27px]
                                "
                              >
                                {item.name}
                              </p>

                              <p
                                className="
                                  mt-3
                                  text-sm
                                  leading-6
                                  text-slate-600
                                "
                              >
                                {item.category || 'Fashion'}
                              </p>
                            </div>

                            {/* PRICE */}
                            <div className="mt-6 flex items-center gap-3">
                              <p
                                className="
                                  text-2xl
                                  font-extrabold
                                  text-rose-600
                                "
                              >
                                ₹{item.price}
                              </p>
                            </div>

                            {/* RATING + QUANTITY */}
                            <div className="mt-4 flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg text-amber-500">
                                  ★
                                </span>

                                <span className="text-sm font-semibold text-slate-800">
                                  {Number(
                                    item.rating ?? 0,
                                  ).toFixed(1)}
                                </span>
                              </div>

                              <span className="text-slate-300">
                                |
                              </span>

                              <p className="text-sm text-slate-500">
                                {Number(item.quantity ?? 0)} items
                                available
                              </p>
                            </div>

                            {/* VIEW BUTTON */}
                            <div className="mt-6">
                              <button
                                type="button"
                                className="
                                  group/view
                                  flex
                                  items-center
                                  gap-6
                                  rounded-xl
                                  border
                                  border-rose-300
                                  bg-white/80
                                  px-5
                                  py-3
                                  text-sm
                                  font-bold
                                  text-rose-600
                                  shadow-sm
                                  backdrop-blur-sm
                                  transition-all
                                  duration-300
                                  hover:bg-white
                                  hover:shadow-md
                                "
                              >
                                <span>
                                  View
                                </span>

                                <span
                                  className="
                                    text-xl
                                    leading-none
                                    transition-transform
                                    duration-300
                                    group-hover/view:translate-x-1
                                  "
                                >
                                  →
                                </span>
                              </button>
                            </div>

                            {/* ADMIN ACTIONS */}
                            {showAdmin && (
                              <div
                                className="
                                  mt-5
                                  flex
                                  gap-2
                                  border-t
                                  border-slate-200/70
                                  pt-4
                                "
                              >
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  className="
                                    flex-1
                                    rounded-full
                                    border
                                    border-slate-200
                                    bg-white/80
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                    backdrop-blur-sm
                                    transition
                                    hover:bg-white
                                  "
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem(itemId)
                                  }
                                  className="
                                    flex-1
                                    rounded-full
                                    border
                                    border-rose-200
                                    bg-white/80
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-rose-600
                                    backdrop-blur-sm
                                    transition
                                    hover:bg-rose-50
                                  "
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="sr-only">
                          {item.category || 'Other'} rating{' '}
                          {Number(
                            item.rating ?? 0,
                          ).toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {showAdmin && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Admin Menu Update
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Add new items for today’s canteen menu.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={addItem}
            >
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Item name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Paneer Wrap"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Price (₹)
                </label>

                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g., 60"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                >
                  <option>Women</option>
                  <option>Men</option>
                  <option>Kids</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Quantity
                </label>

                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Add item
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection