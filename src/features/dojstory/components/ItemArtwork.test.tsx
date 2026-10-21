import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { ItemArtwork } from "./ItemArtwork";

it("fallsBackWhenImageFails", () => {
  const { rerender } = render(<ItemArtwork name="DOJ Grand Contest 1" src="https://doj.kr/api/storage-assets/test" slot="background" />);
  fireEvent.error(screen.getByRole("img", { name: "DOJ Grand Contest 1" }));
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText("DOJ Grand Contest 1")).toBeInTheDocument();
  expect(screen.getByText(/이미지를 불러오지 못/)).toBeInTheDocument();
  rerender(<ItemArtwork name="금빛 심장을 품은 아이" src="/dojstory/golden-heart-doll.svg" slot="doll" />);
  expect(screen.getByRole("img", { name: "금빛 심장을 품은 아이" })).toBeInTheDocument();
});

it("showsWholeBackgroundAtItsNaturalAspectRatio", async () => {
  render(<ItemArtwork name="DOJ Grand Contest 1" src="https://doj.kr/api/storage-assets/test" slot="background" />);
  const image = screen.getByRole("img", { name: "DOJ Grand Contest 1" });
  Object.defineProperties(image, { naturalWidth: { value: 1200 }, naturalHeight: { value: 400 }, height: { value: 400 } });
  // jsdom has no layout; supply the positioning provided by wiki.css in a browser.
  image.parentElement!.style.position = "relative";
  fireEvent.load(image);
  expect(image).toHaveStyle({ objectFit: "contain" });
  await waitFor(() => expect(image.parentElement).toHaveStyle({ aspectRatio: "1200 / 400" }));
});
