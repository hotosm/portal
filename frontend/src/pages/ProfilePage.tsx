import Button from "../components/shared/Button";
import Card from "../components/shared/Card";
import PageWrapper from "../components/shared/PageWrapper";

function ProfilePage() {
  return (
    <PageWrapper>
      <div className="space-y-xl">
        <h2>Profile</h2>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Password</h2>
          <Button>Set password</Button>
        </Card>

        {/* Passkeys Section */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Passkeys</h2>

          <Button>Create a passkey</Button>
        </Card>

        {/* Sessions Section */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sessions</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">macOS (Firefox)</p>
                <p className="text-sm text-hot-yellow-600">Current session</p>
              </div>
              <Button size="small">End session</Button>
            </div>
          </div>
        </Card>

        {/* Account Management Section */}

        <Card className="bg-hot-red-100">
          <h3 className="font-medium text-hot-red-950 mb-2">Delete Account</h3>
          <p className="text-sm text-hot-red-950 mb-3">
            This action cannot be undone. This will permanently delete your
            account and remove all associated data.
          </p>
          <Button slot="footer">Delete account</Button>
        </Card>
      </div>
    </PageWrapper>
  );
}

export default ProfilePage;
