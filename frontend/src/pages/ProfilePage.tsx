import { useState } from "react";
import Button from "../components/shared/Button";
import Card from "../components/shared/Card";

function ProfilePage() {
  const [emails, setEmails] = useState([
    { email: "justina@animus.coop", isPrimary: true },
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [showAddEmail, setShowAddEmail] = useState(false);

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      setEmails([...emails, { email: newEmail, isPrimary: false }]);
      setNewEmail("");
      setShowAddEmail(false);
    }
  };

  const handleSetPrimary = (emailToSetPrimary: string) => {
    setEmails(
      emails.map((emailObj) => ({
        ...emailObj,
        isPrimary: emailObj.email === emailToSetPrimary,
      }))
    );
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (emails.length > 1) {
      setEmails(emails.filter((emailObj) => emailObj.email !== emailToRemove));
    }
  };

  return (
    <>
      <h2>Profile</h2>

      {/* E-mails Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">E-mails</h2>

        <div className="space-y-3 mb-4">
          {emails.map((emailObj, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-900">{emailObj.email}</span>
                {emailObj.isPrimary && (
                  <span className="px-2 py-1  bg-hot-yellow-600 text-xs font-medium rounded">
                    primary
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!emailObj.isPrimary && (
                  <Button
                    size="small"
                    onClick={() => handleSetPrimary(emailObj.email)}
                  >
                    Set as primary
                  </Button>
                )}
                {emails.length > 1 && (
                  <Button
                    size="small"
                    onClick={() => handleRemoveEmail(emailObj.email)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showAddEmail ? (
          <div className="flex gap-3 items-center">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:bg-hot-red-50"
            />
            <Button onClick={handleAddEmail}>Add</Button>
            <Button onClick={() => setShowAddEmail(false)}>Cancel</Button>
          </div>
        ) : (
          <Button onClick={() => setShowAddEmail(true)}>Add e-mail</Button>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Password</h2>
        <Button>Set password</Button>
      </Card>

      {/* Passkeys Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Passkeys</h2>

        <Button>Create a passkey</Button>
      </Card>

      {/* Sessions Section */}
      <Card className="p-6">
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

      <Card className="bg-red-100">
        <h3 className="font-medium text-hot-red-950 mb-2">Delete Account</h3>
        <p className="text-sm text-hot-red-950 mb-3">
          This action cannot be undone. This will permanently delete your
          account and remove all associated data.
        </p>
        <Button slot="footer">Delete account</Button>
      </Card>
    </>
  );
}

export default ProfilePage;
