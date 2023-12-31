"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ServerValidator, ServerSchema } from "@/lib/validators/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileUpload } from "@/components/FileUpload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModalStore";
import axios from "axios";

export const EditServerModal = () => {
  const router = useRouter();
  const { isOpen, onClose, type, server } = useModal((state) => ({
    isOpen: state.isOpen,
    server: state.data.server,
    onClose: state.onClose,
    type: state.type,
  }));

  const form = useForm({
    defaultValues: {
      name: server?.name || "",
      imageUrl: server?.imageUrl || "",
    },
    resolver: zodResolver(ServerSchema),
  });

  const isModalOpen = isOpen && type === "editServer";
  const {
    reset,
    watch,
    setValue,
    formState: { isSubmitting, isSubmitSuccessful, isSubmitted, isValid },
  } = form;

  const [name, imageUrl] = watch(["name", "imageUrl"]);

  const submitHandler = async (values: ServerValidator) => {
    try {
      await axios.patch(`/api/servers/${server?.id}`, values);

      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const closeHandler = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (server) {
      setValue("name", server.name);
      setValue("imageUrl", server.imageUrl);
    }
  }, [server, setValue]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const isButtonDisabled =
    (isSubmitted && !isValid) ||
    (server?.name === name && server?.imageUrl === imageUrl);

  return (
    <Dialog open={isModalOpen} onOpenChange={closeHandler}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a personality with a name and an icon.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className="space-y-8"
          >
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          disabled={isSubmitting || isSubmitSuccessful}
                          endpoint="serverImage"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting || isSubmitSuccessful}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter server name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button
                variant="primary"
                isLoading={isSubmitting}
                disabled={isButtonDisabled}
                type="submit"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
