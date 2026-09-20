import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  MotionConfig,
} from "framer-motion";
import {
  Building2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  getClients,
  deleteClient,
} from "../../services/client.service";

import Loading from "../../components/common/Loading";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

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
  "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 hover:shadow-violet-600/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200";

const editButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-sm font-medium text-[#2B2640] transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const deleteButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition-all hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50";

const metaLabel =
  "text-xs font-medium uppercase tracking-wide text-[#8B879F]";

const searchInput =
  "w-full rounded-xl border border-[#E8E6F2] bg-white px-4 py-3 pr-20 text-sm text-[#2B2640] outline-none transition-all placeholder:text-[#A9A5BF] hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

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
      setError(
        error.message || "Failed to load clients"
      );
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
      <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9FD]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* ---------- Header ---------- */}

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
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:flex">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
                  Clients
                </h1>

                <p className="mt-1 max-w-xl text-sm leading-6 text-[#6B6785]">
                  Manage your clients and their billing
                  information.
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/clients/create"
                className={`${primaryButton} w-full sm:w-auto`}
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Link>
            </motion.div>
          </motion.div>

          {/* ---------- Error ---------- */}

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
                transition={{
                  duration: 0.25,
                }}
                className="overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="shrink-0 rounded-md p-0.5 text-rose-700 transition-colors hover:bg-rose-100 hover:text-rose-900"
                    aria-label="Close error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------- Search + Count ---------- */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: 0.08,
            }}
            className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Search */}

            <div className="relative w-full sm:max-w-md">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9A5BF]"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, company or email..."
                className={`${searchInput} pl-11`}
              />

              {searchLoading ? (
                <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
              ) : search ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#6B6785] transition-colors hover:bg-violet-50 hover:text-[#2B2640]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Client count */}

            <div className="flex items-center gap-2">
              <p className="text-sm text-[#6B6785]">
                {search
                  ? "Search results:"
                  : "Total Clients:"}
              </p>

              <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-sm font-semibold text-violet-700">
                {clients.length}
              </span>
            </div>
          </motion.div>

          {/* ---------- Empty State ---------- */}

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
              className="mt-5 rounded-2xl border border-dashed border-[#D9D5EA] bg-white px-6 py-16 text-center shadow-sm"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <UserRound className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#2B2640]">
                {search
                  ? "No matching clients"
                  : "No clients found"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B6785]">
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
                  <X className="h-4 w-4" />
                  Clear Search
                </button>
              ) : (
                <Link
                  to="/clients/create"
                  className={`${primaryButton} mt-6`}
                >
                  <Plus className="h-4 w-4" />
                  Add Client
                </Link>
              )}
            </motion.div>
          ) : (
            <>
              {/* ---------- Mobile: Cards ---------- */}

              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-5 space-y-3 md:hidden"
              >
                <AnimatePresence>
                  {clients.map((client) => (
                    <motion.li
                      key={client._id}
                      variants={rowVariants}
                      exit={rowExit}
                      layout
                      className="rounded-2xl border border-[#E8E6F2] bg-white p-4 shadow-[0_1px_2px_rgba(43,38,64,0.04)] sm:p-5"
                    >
                      {/* Client Header */}

                      <div className="flex items-start gap-3">
                        <Avatar name={client.name} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[#2B2640]">
                            {client.name || "—"}
                          </p>

                          {client.email && (
                            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-[#6B6785]">
                              <Mail className="h-3.5 w-3.5 shrink-0" />

                              <p className="truncate">
                                {client.email}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Client Details */}

                      <dl className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#F9F8FC] p-3">
                          <dt className={metaLabel}>
                            Company
                          </dt>

                          <dd className="mt-1 break-words text-sm font-medium text-[#2B2640]">
                            {client.companyName || "—"}
                          </dd>
                        </div>

                        <div className="rounded-xl bg-[#F9F8FC] p-3">
                          <dt className={metaLabel}>
                            Contact
                          </dt>

                          <dd className="mt-1 break-words text-sm font-medium text-[#2B2640]">
                            {client.phone || "—"}
                          </dd>
                        </div>

                        <div className="col-span-2 rounded-xl bg-[#F9F8FC] p-3">
                          <dt className={metaLabel}>
                            GST Number
                          </dt>

                          <dd className="mt-1 break-words text-sm font-medium text-[#2B2640]">
                            {client.gstNumber || "—"}
                          </dd>
                        </div>
                      </dl>

                      {/* Actions */}

                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F0EEF7] pt-4">
                        <Link
                          to={`/clients/edit/${client._id}`}
                          className={editButton}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(client._id)
                          }
                          className={deleteButton}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>

              {/* ---------- Tablet / Desktop: shadcn Table ---------- */}

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
                  delay: 0.1,
                }}
                className="mt-5 hidden overflow-hidden rounded-2xl border border-[#E8E6F2] bg-white shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-20px_rgba(91,33,182,0.15)] md:block"
              >
                {/* Table Header */}

                <div className="border-b border-[#E8E6F2] bg-white px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-[#2B2640]">
                        All Clients
                      </h2>

                      <p className="mt-0.5 text-xs text-[#8B879F]">
                        Manage your client records
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                      <UserRound className="h-3.5 w-3.5" />

                      {clients.length}{" "}
                      {clients.length === 1
                        ? "Client"
                        : "Clients"}
                    </div>
                  </div>
                </div>

                {/* Table */}

                <div className="overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow className="border-[#E8E6F2] bg-[#FBFAFE] hover:bg-[#FBFAFE]">
                        <TableHead className="h-12 px-6 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Client
                        </TableHead>

                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Company
                        </TableHead>

                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Contact
                        </TableHead>

                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          GST Number
                        </TableHead>

                        <TableHead className="h-12 px-6 text-right text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      <AnimatePresence>
                        {clients.map((client) => (
                          <motion.tr
                            key={client._id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="show"
                            exit={rowExit}
                            layout
                            className="border-[#F0EEF7] transition-colors hover:bg-[#FCFBFE]"
                          >
                            {/* Client */}

                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={client.name}
                                />

                                <div className="min-w-0">
                                  <p className="font-semibold text-[#2B2640]">
                                    {client.name || "—"}
                                  </p>

                                  {client.email && (
                                    <div className="mt-0.5 flex max-w-[250px] items-center gap-1.5">
                                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#8B879F]" />

                                      <p className="truncate text-sm text-[#6B6785]">
                                        {client.email}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Company */}

                            <TableCell>
                              <div className="flex min-w-[160px] items-center gap-2 text-sm text-[#4A4563]">
                                <Building2 className="h-4 w-4 shrink-0 text-[#A09BB7]" />

                                <span>
                                  {client.companyName ||
                                    "—"}
                                </span>
                              </div>
                            </TableCell>

                            {/* Contact */}

                            <TableCell className="whitespace-nowrap text-sm text-[#4A4563]">
                              {client.phone || "—"}
                            </TableCell>

                            {/* GST */}

                            <TableCell className="whitespace-nowrap text-sm text-[#4A4563]">
                              {client.gstNumber || "—"}
                            </TableCell>

                            {/* Actions */}

                            <TableCell className="px-6">
                              <div className="flex justify-end gap-2">
                                <Link
                                  to={`/clients/edit/${client._id}`}
                                  className={editButton}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
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
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Table Footer */}

                <div className="border-t border-[#E8E6F2] bg-[#FBFAFE] px-6 py-3">
                  <p className="text-xs text-[#8B879F]">
                    Showing{" "}
                    <span className="font-semibold text-[#4A4563]">
                      {clients.length}
                    </span>{" "}
                    {clients.length === 1
                      ? "client"
                      : "clients"}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </MotionConfig>
  );
};

export default Clients;