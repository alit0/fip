import { describe, it, expect, vi } from "vitest";
import {
  HOME_INSTITUTIONAL_PAGE_CONTENT,
  seedPageContentEntries,
} from "../../scripts/page-content-seed-data";

describe("seedPageContentEntries", () => {
  it("creates missing entries and skips existing entries without updating", async () => {
    const create = vi.fn().mockResolvedValue({});
    const update = vi.fn().mockResolvedValue({});
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: "existing" }] });

    const report = await seedPageContentEntries(
      { find, create },
      [
        HOME_INSTITUTIONAL_PAGE_CONTENT[0],
        HOME_INSTITUTIONAL_PAGE_CONTENT[1],
      ],
    );

    expect(report).toEqual({ created: 1, skipped: 1, errors: 0 });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "page-content",
        locale: "es",
        data: expect.objectContaining({
          pageKey: "home",
          sectionKey: "institutional-intro",
        }),
      }),
    );
    expect(update).not.toHaveBeenCalled();
  });
});
