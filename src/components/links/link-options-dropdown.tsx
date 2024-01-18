"use client";

import * as React from "react";
import { deleteShortLink } from "~/server/actions/link";
import { type ShortLink } from "~/server/db/schema";
import { type Session } from "next-auth";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Icons, iconVariants } from "~/components/ui/icons";

import { CustomLinkDialog } from "./custom-link-dialog";
import { LinkQRCodeDialog } from "./link-qrcode-dialog";

const LinkOptionsDropdown = React.forwardRef<
  React.ElementRef<typeof DropdownMenuTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger> & {
    link: ShortLink;
    session?: Session | null;
  }
>(({ link, session, className, disabled, ...props }, ref) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditLinkDialogOpen, setIsEditLinkDialogOpen] = React.useState(false);
  const [isLinkQRCodeDialogOpen, setIsLinkQRCodeDialogOpen] =
    React.useState(false);

  const decodedURL = decodeURIComponent(link.url);

  const { execute: deleteLink, status: deleteLinkStatus } = useAction(
    deleteShortLink,
    {
      onSuccess() {
        toast.info("Link deleted successfully");
        setIsDeleteDialogOpen(false);
      },
      onError(error) {
        toast.error(error.serverError);
      },
    },
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "cursor-pointer transition-opacity opacity-50 hover:opacity-100",
              className,
            )}
            aria-label="link actions menu"
            type="button"
            ref={ref}
            {...props}
          >
            <Icons.MoreVertical className={iconVariants()} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setIsLinkQRCodeDialogOpen(true)}
            disabled={disabled}
          >
            <Icons.QrCode className={iconVariants({ className: "mr-2" })} />
            QR Code
          </DropdownMenuItem>
          {session && (
            <DropdownMenuItem
              onClick={() => setIsEditLinkDialogOpen(true)}
              disabled={disabled}
            >
              <Icons.Pencil className={iconVariants({ className: "mr-2" })} />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={disabled}
          >
            <Icons.Trash2 className={iconVariants({ className: "mr-2" })} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[22rem] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => deleteLink({ slug: link.slug })}
              isLoading={deleteLinkStatus === "executing"}
            >
              {deleteLinkStatus === "executing"
                ? "Deleting link..."
                : "Delete link"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CustomLinkDialog
        open={isEditLinkDialogOpen}
        onOpenChange={setIsEditLinkDialogOpen}
        defaultValues={link}
        isEditing
      />
      <LinkQRCodeDialog
        isOpen={isLinkQRCodeDialogOpen}
        onOpenChange={setIsLinkQRCodeDialogOpen}
        url={decodedURL}
        slug={link.slug}
      />
    </>
  );
});
LinkOptionsDropdown.displayName = "LinkOptionsDropdown";

export { LinkOptionsDropdown };
