import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/types";
import PaymentModal from "@/components/PaymentModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Contact {
  name: string;
  amount: number;
}

const SendMoneyPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    // Simulated fetch – replace this with actual API call or user context
    const fetchContacts = async () => {
      // Example static user data; replace with actual user data
      const userContacts: Contact[] = [
        { name: "Ananya", amount: 150 },
        { name: "Vikram", amount: 450 },
        { name: "Kiran", amount: 300 },
        { name: "Meena", amount: 900 },
      ];
      setContacts(userContacts);
    };

    fetchContacts();
  }, []);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedContact(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Send Money</h1>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Select a Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <Button
                key={contact.name}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => handleSelectContact(contact)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                <span className="font-semibold">{contact.name}</span>
                <span className="text-muted-foreground text-sm">₹{contact.amount}</span>
              </Button>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Cancel
          </Button>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedContact && (
            <PaymentModal
              paymentDetails={{
                amount: selectedContact.amount,
                to: selectedContact.name,
                description: `Money transfer to ${selectedContact.name}`,
              }}
              onClose={handleClosePaymentModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendMoneyPage;
