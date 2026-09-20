import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

import {
  getClients,
  deleteClient,
} from "../../services/client.service";

import Loading from "../../components/common/Loading";

/* ---------- Animation variants ---------- */

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const rowExit = {
  opacity: 0,
  x: -16,
  transition: {
    duration: 0.2,
  },
};

/* ---------- Shared styles ---------- */

const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200";

const editButton =
  "inline-flex items-center justify-center rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const deleteButton =
  "inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50";

const headerCell =
  "px-6 py-3.5 text-left text-xs font-medium text-[#6B6785]";

const searchInput =
  "w-full rounded-xl border border-[#E8E6F2] bg-white px-4 py-3 pr-10 text-sm text-[#2B2640] outline-none transition placeholder:text-[#A9A5BF] hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

/* ---------- Avatar ---------- */

const Avatar = ({ name }) => (
  <div
    aria-hidden="true"
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700"
  >
    {name?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

/* ---------- Clients ---------- */

const Clients = () => {
  const [clients, setClients] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Fetch clients ---------- */

  const fetchClients = async (searchValue = "") => {
    try {
      setError("");

      if (searchValue) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      const data = await getClients(searchValue);

      setClients(data.clients || []);
    } catch (error) {
      setError(error.message || "Failed to load clients");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  /* ---------- Initial fetch ---------- */

  useEffect(() => {
    fetchClients();
  }, []);

  /* ---------- Search debounce ---------- */

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchClients(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  /* ---------- Delete client ---------- */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteClient(id);

      setClients((previousClients) =>
        previousClients.filter(
          (client) => client._id !== id
        )
      );
    } catch (error) {
      /*
       * Backend now prevents deleting a client
       * if invoices exist for that client.
       *
       * The backend returns a 409 response with:
       * "Client cannot be deleted because invoices exist for this client"
       */
      setError(
        error.message || "Failed to delete client"
      );
    }
  };

  /* ---------- Clear search ---------- */

  const handleClearSearch = () => {
    setSearch("");
  };

  /* ---------- Loading ---------- */

  if (loading) {
    return <Loading />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
              Clients
            </h1>

            <p className="mt-1 text-sm text-[#6B6785]">
              Manage your clients and their billing
              information.
            </p>
          </div>

          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <Link
              to="/clients/create"
              className={`${primaryButton} w-full`}
            >
              + Add Client
            </Link>
          </motion.div>
        </motion.div>

        {/* Error */}

        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key="error"
              role="alert"
              initial={{
                opacity: 0,
                height: 0,
                marginTop: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                marginTop: 24,
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginTop: 0,
              }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 font-semibold text-rose-700 hover:text-rose-900"
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Count */}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Search */}

          <div className="relative w-full sm:max-w-md">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, company or email..."
              className={searchInput}
            />

            {search ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#6B6785] transition-colors hover:text-[#2B2640]"
                aria-label="Clear search"
              >
                ×
              </button>
            ) : (
              <svg
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A9A5BF]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                />
              </svg>
            )}

            {searchLoading && (
              <span className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            )}
          </div>

          {/* Client count */}

          <p className="text-sm text-[#6B6785]">
            {search ? (
              <>
                Search results:{" "}
                <span className="font-semibold text-[#2B2640]">
                  {clients.length}
                </span>
              </>
            ) : (
              <>
                Total Clients:{" "}
                <span className="font-semibold text-[#2B2640]">
                  {clients.length}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Empty State */}

        {clients.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="mt-4 rounded-2xl border border-dashed border-[#D9D5EA] bg-white px-6 py-16 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#2B2640]">
              {search
                ? "No matching clients"
                : "No clients found"}
            </h2>

            <p className="mt-2 text-sm text-[#6B6785]">
              {search
                ? "Try searching with a different name, company or email."
                : "Start by adding your first client."}
            </p>

            {search ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className={`${primaryButton} mt-6`}
              >
                Clear Search
              </button>
            ) : (
              <Link
                to="/clients/create"
                className={`${primaryButton} mt-6`}
              >
                Add Client
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            {/* ---------- Mobile: cards ---------- */}

            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="mt-4 space-y-3 md:hidden"
            >
              <AnimatePresence>
                {clients.map((client) => (
                  <motion.li
                    key={client._id}
                    variants={rowVariants}
                    exit={rowExit}
                    className="rounded-2xl border border-[#E8E6F2] bg-white p-4 shadow-[0_1px_2px_rgba(43,38,64,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={client.name} />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[#2B2640]">
                          {client.name}
                        </p>

                        <p className="mt-0.5 truncate text-sm text-[#6B6785]">
                          {client.email}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-[#6B6785]">
                          Company
                        </dt>

                        <dd className="mt-0.5 break-words text-[#2B2640]">
                          {client.companyName || "—"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-[#6B6785]">
                          Contact
                        </dt>

                        <dd className="mt-0.5 break-words text-[#2B2640]">
                          {client.phone || "—"}
                        </dd>
                      </div>

                      <div className="col-span-2">
                        <dt className="text-xs text-[#6B6785]">
                          GST Number
                        </dt>

                        <dd className="mt-0.5 break-words text-[#2B2640]">
                          {client.gstNumber || "—"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F0EEF7] pt-4">
                      <Link
                        to={`/clients/edit/${client._id}`}
                        className={editButton}
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(client._id)
                        }
                        className={deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            {/* ---------- Tablet / Desktop: table ---------- */}

            <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[#E8E6F2] bg-white shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-20px_rgba(91,33,182,0.15)] md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#E8E6F2] bg-[#FBFAFE]">
                    <tr>
                      <th className={headerCell}>
                        Client
                      </th>

                      <th className={headerCell}>
                        Company
                      </th>

                      <th className={headerCell}>
                        Contact
                      </th>

                      <th className={headerCell}>
                        GST Number
                      </th>

                      <th
                        className={`${headerCell} text-right`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <motion.tbody
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-[#F0EEF7]"
                  >
                    <AnimatePresence>
                      {clients.map((client) => (
                        <motion.tr
                          key={client._id}
                          variants={rowVariants}
                          exit={rowExit}
                          className="transition-colors hover:bg-[#FBFAFE]"
                        >
                          {/* Client */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={client.name}
                              />

                              <div className="min-w-0">
                                <p className="font-medium text-[#2B2640]">
                                  {client.name}
                                </p>

                                <p className="mt-0.5 text-sm text-[#6B6785]">
                                  {client.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Company */}

                          <td className="px-6 py-4 text-sm text-[#4A4563]">
                            {client.companyName || "—"}
                          </td>

                          {/* Contact */}

                          <td className="px-6 py-4 text-sm text-[#4A4563]">
                            {client.phone || "—"}
                          </td>

                          {/* GST */}

                          <td className="px-6 py-4 text-sm text-[#4A4563]">
                            {client.gstNumber || "—"}
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/clients/edit/${client._id}`}
                                className={editButton}
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    client._id
                                  )
                                }
                                className={deleteButton}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MotionConfig>
  );
};

export default Clients;