export const PrivacyPolicy = () => {
  return (
    <div class="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
        <h1 class="mb-2 font-bold text-3xl text-gray-900">Privacy Policy</h1>
        <p class="mb-8 text-gray-600 text-sm">Effective Date: October 31, 2025</p>

        <section class="mb-8">
          <h2 class="mb-3 font-semibold text-gray-800 text-xl">1. Information We Collect</h2>
          <p class="mb-3 text-gray-700 leading-relaxed">We collect:</p>
          <ul class="ml-4 list-inside list-disc space-y-2 text-gray-700">
            <li>
              <span class="font-medium">Account Data:</span> Name, email address, and login details.
            </li>
            <li>
              <span class="font-medium">Client Data:</span> Information you voluntarily enter for client profiles (e.g., names, measurements, project notes).
            </li>
            <li>
              <span class="font-medium">Usage Data:</span> Device type, app activity, and preferences to improve user experience.
            </li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="mb-3 font-semibold text-gray-800 text-xl">2. How We Use Your Information</h2>
          <p class="mb-3 text-gray-700 leading-relaxed">We use your information to:</p>
          <ul class="ml-4 list-inside list-disc space-y-2 text-gray-700">
            <li>Provide and maintain the App's features.</li>
            <li>Store and display your uploaded content.</li>
            <li>Improve user experience and app functionality.</li>
            <li>Communicate account or feature updates.</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="mb-3 font-semibold text-gray-800 text-xl">3. Data Storage and Security</h2>
          <p class="text-gray-700 leading-relaxed">
            All data is securely stored using encrypted connections. We implement administrative, technical, and physical safeguards to protect your information from unauthorized
            access.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-3 font-semibold text-gray-800 text-xl">4. Sharing of Information</h2>
          <p class="text-gray-700 leading-relaxed">
            We do not sell or rent your personal information. Data may only be shared with trusted third-party service providers (e.g., authentication, analytics) under
            confidentiality agreements.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-3 font-semibold text-gray-800 text-xl">5. Your Rights</h2>
          <p class="text-gray-700 leading-relaxed">
            You may access, modify, or delete your data at any time via your account settings. To request full data removal, contact our support team.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-3 font-semibold text-gray-800 text-xl">6. Retention</h2>
          <p class="text-gray-700 leading-relaxed">
            We retain data only as long as necessary for service provision or legal obligations. Once deleted, your information cannot be recovered.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-3 font-semibold text-gray-800 text-xl">7. Policy Updates</h2>
          <p class="text-gray-700 leading-relaxed">
            This Privacy Policy may be updated periodically. Users will be notified of any material changes through in-app notifications or email.
          </p>
        </section>

        <div class="mt-12 border-gray-200 border-t pt-6">
          <p class="text-center text-gray-600 text-sm">
            For privacy-related inquiries, please contact our
            <a href="mailto:hello@hemline.studio" class="underline">
              support team - hello@hemline.studio
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
