import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <span className="text-sm font-black">
                  SN
                </span>
              </div>

              <div>
                <p className="text-base font-black tracking-tight text-slate-900">
                  StyleNest
                </p>

                <p className="text-[11px] font-medium text-slate-400">
                  Style that feels right
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              Discover quality fashion and everyday essentials
              curated to make your shopping experience simple
              and enjoyable.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                Secure Payments
              </span>

              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                Easy Shopping
              </span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Shop
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li>
                <a
                  href="/products"
                  className="transition hover:text-slate-900"
                >
                  All Products
                </a>
              </li>

              <li>
                <a
                  href="/women"
                  className="transition hover:text-slate-900"
                >
                  Women
                </a>
              </li>

              <li>
                <a
                  href="/men"
                  className="transition hover:text-slate-900"
                >
                  Men
                </a>
              </li>

              <li>
                <a
                  href="/kids"
                  className="transition hover:text-slate-900"
                >
                  Kids
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Help
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li>
                <a
                  href="/my-orders"
                  className="transition hover:text-slate-900"
                >
                  My Orders
                </a>
              </li>

              <li>
                <a
                  href="/contact"
                  className="transition hover:text-slate-900"
                >
                  Contact Us
                </a>
              </li>

              <li>
                <a
                  href="/support"
                  className="transition hover:text-slate-900"
                >
                  Support
                </a>
              </li>

              <li>
                <a
                  href="/terms"
                  className="transition hover:text-slate-900"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Get in touch
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <p>
                <span className="font-semibold text-slate-700">
                  Phone
                </span>
                <br />
                +91 98765 43210
              </p>

              <p className="break-all">
                <span className="font-semibold text-slate-700">
                  Email
                </span>
                <br />
                hello@stylenest.in
              </p>

              <p>
                <span className="font-semibold text-slate-700">
                  Support
                </span>
                <br />
                Mon - Sat, 9 AM - 6 PM
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="mailto:hello@stylenest.in"
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Email Us
              </a>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400 sm:text-xs">
            © 2026 StyleNest. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-400 sm:text-xs">
            <a
              href="/privacy"
              className="transition hover:text-slate-700"
            >
              Privacy
            </a>

            <a
              href="/terms"
              className="transition hover:text-slate-700"
            >
              Terms
            </a>

            <a
              href="/support"
              className="transition hover:text-slate-700"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;