import Button from "@/components/Button/Button";
import useChatContext from "@/useChatContext";
import { useCallback, useState } from "react";
import { Profile } from "@/lib/command";
import { Input } from "@/components/Input";
import { EmptyProfile } from "@/lib/const";
import { FormProps } from ".";
import { parseSimplexWsChatError } from "@/lib/utils";

export const CreateUserForm = ({ onSubmit }: FormProps<Profile>) => {
  const { client } = useChatContext();
  const [profile, setProfile] = useState<Profile>(EmptyProfile);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleCreateUser = useCallback(async () => {
    const corrId = await client.current?.apiCreateUser(profile);
    if (corrId) {
      const data = await client.current?.waitCommandResponse(corrId);
      if (data?.type === "chatCmdError") {
        setError(parseSimplexWsChatError(data));
      } else if (data?.type === "activeUser") {
        setError(null);
        setProfile(EmptyProfile);
        setSubmitted(true);
        onSubmit?.(profile);
      }
    }
  }, [onSubmit, profile, client]);

  const handleProfileUpdate = useCallback(
    <F extends keyof Profile>(field: F, value: Profile[F]) => {
      setProfile((p) => ({ ...p, [field]: value }));
    },
    [],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          handleProfileUpdate("image", base64String);
        };
        reader.readAsDataURL(file);
      }
    },
    [handleProfileUpdate],
  );

  // const resetDialog = useCallback(() => {
  //   setProfile(EmptyProfile);
  //   setError(null);
  //   setSubmitted(false);
  // }, []);

  return (
    <div className="space-y-8">
      <div>
        {profile.image && (
          <div className="mt-4">
            <img
              src={profile.image}
              alt="Profile Preview"
              className="max-w-full h-auto max-h-24 rounded-md"
            />
          </div>
        )}
      </div>
      <form className="space-y-4">
        <Input
          placeholder="Display Name"
          onChange={(e) => handleProfileUpdate("displayName", e.target.value)}
        ></Input>
        <Input
          placeholder="Full Name"
          onChange={(e) => handleProfileUpdate("fullName", e.target.value)}
        ></Input>
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
      </form>
      <div className="flex flex-col gap-2">
        <span className="text-red-500">{error ? `Error: ${error}` : null}</span>
        <span className="text-theme-green">
          {submitted ? `Profile created!` : null}
        </span>
        <Button onClick={handleCreateUser}>Create</Button>
      </div>
    </div>
  );
};
