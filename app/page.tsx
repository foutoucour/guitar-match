import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Guitar Match</h1>
      <p className="text-gray-600 mb-8">Vote for your favourite guitar</p>
      <Link
        href="/random"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Mode Random
      </Link>
    </main>
  );
}
