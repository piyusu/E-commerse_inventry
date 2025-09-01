import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">E-Commerce</h1>
        <nav className="flex gap-6">
          <Link href="/" className="hover:text-blue-500 cursor-pointer">Products</Link>
          <Link href="/cart" className="hover:text-blue-500 cursor-pointer">Cart</Link>
          <Link href="/categories" className="hover:text-blue-400">Categories</Link>
          <Link href="/order" className="hover:text-blue-500 cursor-pointer">Orders</Link>
        </nav>
      </div>
    </header>
  );
}
