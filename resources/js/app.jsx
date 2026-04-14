import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

function useAutoTranslate(sourceText, setTargetText) {
    useEffect(() => {
        if (!sourceText.trim()) {
            setTargetText("");
            return;
        }

        let isCurrent = true;
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch("/translate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    body: JSON.stringify({
                        q: sourceText,
                    }),
                });

                const data = await response.json();

                if (isCurrent && data && data.translatedText) {
                    setTargetText(data.translatedText);
                }
            } catch (error) {
                console.error("Translation error", error);
            }
        }, 500);

        return () => {
            isCurrent = false;
            clearTimeout(timeoutId);
        };
    }, [sourceText, setTargetText]);
}

function App() {
    const [englishName, setEnglishName] = useState("");
    const [bengaliName, setBengaliName] = useState("");

    const [englishCategory, setEnglishCategory] = useState("");
    const [bengaliCategory, setBengaliCategory] = useState("");

    const [englishBrand, setEnglishBrand] = useState("");
    const [bengaliBrand, setBengaliBrand] = useState("");

    const [englishDescription, setEnglishDescription] = useState("");
    const [bengaliDescription, setBengaliDescription] = useState("");

    const [price, setPrice] = useState("");
    const [bengaliPrice, setBengaliPrice] = useState("");

    const [viewMode, setViewMode] = useState("create");
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");

    const handleEnglishNameChange = (event) => {
        const value = event.target.value;
        setEnglishName(value);
    };

    const handleBengaliNameChange = (event) => {
        setBengaliName(event.target.value);
    };

    const numberToBanglaWords = (value) => {
        if (!value) return "";

        const digitMap = {
            0: "০",
            1: "১",
            2: "২",
            3: "৩",
            4: "৪",
            5: "৫",
            6: "৬",
            7: "৭",
            8: "৮",
            9: "৯",
        };

        let result = "";
        for (const ch of value.toString()) {
            if (digitMap[ch] !== undefined) {
                result += digitMap[ch];
            } else {
                result += ch;
            }
        }

        return result;
    };

    useAutoTranslate(englishName, setBengaliName);
    useAutoTranslate(englishCategory, setBengaliCategory);
    useAutoTranslate(englishBrand, setBengaliBrand);
    useAutoTranslate(englishDescription, setBengaliDescription);

    const loadProducts = async () => {
        setProductsLoading(true);
        setProductsError("");

        try {
            const response = await fetch("/api/products", {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load products");
            }

            const data = await response.json();
            setProducts(Array.isArray(data.data) ? data.data : data);
        } catch (error) {
            setProductsError(
                error.message || "Failed to load products. Please try again.",
            );
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSaving(true);
        setSaveError("");
        setSaveSuccess("");

        try {
            const url = isEditing
                ? `/api/products/${currentProductId}`
                : "/api/products";

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name_en: englishName,
                    name_bn: bengaliName,
                    category_en: englishCategory,
                    category_bn: bengaliCategory,
                    brand_en: englishBrand,
                    brand_bn: bengaliBrand,
                    price: price ? Number(price) : 0,
                    price_bn: bengaliPrice,
                    description_en: englishDescription,
                    description_bn: bengaliDescription,
                }),
            });

            if (!response.ok) {
                let message = "Failed to save product";
                try {
                    const data = await response.json();
                    if (data?.message) {
                        message = data.message;
                    }
                } catch {
                    // ignore JSON parse errors
                }
                throw new Error(message);
            }

            setSaveSuccess(
                isEditing
                    ? "Product updated successfully."
                    : "Product saved successfully.",
            );
            await loadProducts();
            setViewMode("list");
            setIsEditing(false);
            setCurrentProductId(null);
        } catch (error) {
            setSaveError(error.message || "Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 px-4 md:px-8 py-10 flex flex-col">
            <div className="w-full bg-white shadow-sm border border-slate-200 p-4 md:p-6 rounded-none">
                <header className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        {viewMode === "list" ? (
                            <>
                                <h1 className="text-bold text-slate-600 mb-1">
                                    Product List
                                </h1>
                            </>
                        ) : (
                            <>
                                <h1 className="text-bold text-slate-600 mb-1">
                                    Create Product
                                </h1>
                            </>
                        )}
                        
                    </div>
                    <div className="flex items-center gap-2">
                        {viewMode === "list" ? (
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                onClick={() => {
                                    setViewMode("create");
                                    setIsEditing(false);
                                    setCurrentProductId(null);
                                    setEnglishName("");
                                    setBengaliName("");
                                    setEnglishCategory("");
                                    setBengaliCategory("");
                                    setEnglishBrand("");
                                    setBengaliBrand("");
                                    setPrice("");
                                    setBengaliPrice("");
                                    setEnglishDescription("");
                                    setBengaliDescription("");
                                    setSaveSuccess("");
                                    setSaveError("");
                                }}
                            >
                                + Create Product
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300"
                                onClick={() => {
                                    setViewMode("list");
                                    setSaveSuccess("");
                                    setSaveError("");
                                }}
                            >
                                ← Back to List
                            </button>
                        )}
                    </div>
                </header>
                {(saveSuccess || saveError) && (
                    <div className="mb-4">
                        {saveSuccess && (
                            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                                {saveSuccess}
                            </p>
                        )}
                        {saveError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                {saveError}
                            </p>
                        )}
                    </div>
                )}

                {viewMode === "list" ? (
                    <section className="space-y-4">
                        {productsLoading && (
                            <p className="text-sm text-slate-500">
                                Loading products...
                            </p>
                        )}
                        {productsError && (
                            <p className="text-sm text-red-600">
                                {productsError}
                            </p>
                        )}
                        {!productsLoading && !productsError && (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Name (EN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Name (BN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Category (EN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Category (BN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Brand (EN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Brand (BN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Price (BDT)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Price (BN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Description (EN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Description (BN)
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Created At
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td
                                                    className="px-4 py-3 text-center text-slate-500"
                                                    colSpan={11}
                                                >
                                                    No products found.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className="border-t border-slate-200 hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-2">
                                                        {product.name_en}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {product.name_bn}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {product.category_en}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {product.category_bn}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {product.brand_en}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {product.brand_bn}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {product.price}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {product.price_bn}
                                                    </td>
                                                    <td className="px-4 py-2 max-w-xs truncate">
                                                        {product.description_en}
                                                    </td>
                                                    <td className="px-4 py-2 max-w-xs truncate">
                                                        {product.description_bn}
                                                    </td>
                                                    <td className="px-4 py-2 text-slate-500">
                                                        {product.created_at
                                                            ? new Date(
                                                                  product.created_at,
                                                              ).toLocaleString()
                                                            : ""}
                                                    </td>
                                                    <td className="px-4 py-2 space-x-2">
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                                            onClick={() => {
                                                                setIsEditing(
                                                                    true,
                                                                );
                                                                setCurrentProductId(
                                                                    product.id,
                                                                );
                                                                setEnglishName(
                                                                    product.name_en ||
                                                                        "",
                                                                );
                                                                setBengaliName(
                                                                    product.name_bn ||
                                                                        "",
                                                                );
                                                                setEnglishCategory(
                                                                    product.category_en ||
                                                                        "",
                                                                );
                                                                setBengaliCategory(
                                                                    product.category_bn ||
                                                                        "",
                                                                );
                                                                setEnglishBrand(
                                                                    product.brand_en ||
                                                                        "",
                                                                );
                                                                setBengaliBrand(
                                                                    product.brand_bn ||
                                                                        "",
                                                                );
                                                                setPrice(
                                                                    product.price !=
                                                                        null
                                                                        ? String(
                                                                              product.price,
                                                                          )
                                                                        : "",
                                                                );
                                                                setBengaliPrice(
                                                                    product.price_bn ||
                                                                        "",
                                                                );
                                                                setEnglishDescription(
                                                                    product.description_en ||
                                                                        "",
                                                                );
                                                                setBengaliDescription(
                                                                    product.description_bn ||
                                                                        "",
                                                                );
                                                                setSaveSuccess(
                                                                    "",
                                                                );
                                                                setSaveError(
                                                                    "",
                                                                );
                                                                setViewMode(
                                                                    "create",
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1 text-xs rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                                            onClick={async () => {
                                                                if (
                                                                    !window.confirm(
                                                                        "Delete this product?",
                                                                    )
                                                                ) {
                                                                    return;
                                                                }

                                                                try {
                                                                    setSaveSuccess(
                                                                        "",
                                                                    );
                                                                    setSaveError(
                                                                        "",
                                                                    );
                                                                    const response =
                                                                        await fetch(
                                                                            `/api/products/${product.id}`,
                                                                            {
                                                                                method: "DELETE",
                                                                                headers:
                                                                                    {
                                                                                        Accept: "application/json",
                                                                                    },
                                                                            },
                                                                        );

                                                                    if (
                                                                        !response.ok
                                                                    ) {
                                                                        throw new Error(
                                                                            "Failed to delete product",
                                                                        );
                                                                    }

                                                                    await loadProducts();
                                                                } catch (error) {
                                                                    setSaveError(
                                                                        error.message ||
                                                                            "Failed to delete product.",
                                                                    );
                                                                    return;
                                                                }
                                                                setSaveSuccess(
                                                                    "Product deleted successfully.",
                                                                );
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                ) : (
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* Product Name */}
                        <section>
                            <h2 className="text-base font-semibold text-slate-800 mb-4">
                                {isEditing ? "Edit Product" : "Product Name"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        English Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300"
                                        placeholder="e.g., Mango"
                                        value={englishName}
                                        onChange={handleEnglishNameChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        Bangla Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:none "
                                        placeholder="স্বয়ংক্রিয়ভাবে পূরণ করা হবে"
                                        value={bengaliName}
                                        onChange={handleBengaliNameChange}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Category */}
                        <section>
                            <h2 className="text-base font-semibold text-slate-800 mb-4">
                                Category
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        English Category
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300"
                                        placeholder="e.g., Fruits"
                                        value={englishCategory}
                                        onChange={(e) =>
                                            setEnglishCategory(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        Bangla Category
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:none "
                                        placeholder="স্বয়ংক্রিয়ভাবে পূরণ করা হবে"
                                        value={bengaliCategory}
                                        onChange={(e) =>
                                            setBengaliCategory(e.target.value)
                                        }
                                        readOnly
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Brand  */}
                        <section>
                            <h2 className="text-base font-semibold text-slate-800 mb-4">
                                Brand
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        English Brand
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300"
                                        placeholder="e.g., Fresh Farm"
                                        value={englishBrand}
                                        onChange={(e) =>
                                            setEnglishBrand(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        Bangla Brand
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:none "
                                        placeholder="স্বয়ংক্রিয়ভাবে পূরণ করা হবে"
                                        value={bengaliBrand}
                                        onChange={(e) =>
                                            setBengaliBrand(e.target.value)
                                        }
                                        readOnly
                                    />
                                </div>
                            </div>
                            <h2 className="text-base font-semibold text-slate-800 mb-4">
                                Price
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        Price (BDT)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPrice(value);
                                            setBengaliPrice(
                                                numberToBanglaWords(value),
                                            );
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        Price Bangla
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:none "
                                        placeholder="স্বয়ংক্রিয়ভাবে পূরণ করা হবে"
                                        value={bengaliPrice}
                                        onChange={(e) =>
                                            setBengaliPrice(e.target.value)
                                        }
                                        readOnly
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section>
                            <h2 className="text-base font-semibold text-slate-800 mb-4">
                                Description
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        English Description (Optional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-300"
                                        placeholder="Product description"
                                        value={englishDescription}
                                        onChange={(e) =>
                                            setEnglishDescription(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        Bangla Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:none "
                                        placeholder="স্বয়ংক্রিয়ভাবে পূরণ করা হবে"
                                        value={bengaliDescription}
                                        onChange={(e) =>
                                            setBengaliDescription(
                                                e.target.value,
                                            )
                                        }
                                        readOnly
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="inline-flex items-center px-5 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

const rootElement = document.getElementById("react-root");

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
