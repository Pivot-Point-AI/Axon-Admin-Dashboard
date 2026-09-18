import Image from "next/image";

export default function UserMetaCard() {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center lg:gap-6">
        <div className="overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
          <Image
            src="/images/user/owner.png"
            width={80}
            height={80}
            className="size-20"
            alt="Admin"
          />
        </div>
        <div className="text-start">
          <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            Admin
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bank Assistant Administrator
          </p>
        </div>
      </div>
    </div>
  );
}
