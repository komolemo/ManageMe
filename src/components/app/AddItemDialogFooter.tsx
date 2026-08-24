import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

export function AddItemDialogFooter({
	resetDialog,
	isDisabled,
	isCreating,
	submitLabel,
}: {
	resetDialog: ()=> void;
	isDisabled: boolean;
	isCreating: boolean;
	submitLabel: string;
}) {
	const { t } = useTranslation();
	return (
		<>
			<Button
				className="w-[100px] rounded-md p-[8px] text-foreground"
				onClick={resetDialog}
				type="button"
				variant="outline"
			>
				{t("common.cancel")}
			</Button>
			<Button
				className="w-[100px] rounded-md bg-[#238636] p-[8px] text-[#fff] hover:bg-[#2ea043]"
				disabled={isDisabled || isCreating}
				type="submit"
			>
				{submitLabel}
			</Button>
		</>
	)
}