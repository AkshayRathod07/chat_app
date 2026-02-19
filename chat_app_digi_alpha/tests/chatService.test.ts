import * as chatService from "../src/services/chatService";
import Message from "../src/models/Message";

describe("chatService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("saveMessage persists and returns object", async () => {
    const mockSave = jest
      .spyOn(Message.prototype as any, "save")
      .mockResolvedValue(undefined);
    const mockToObject = jest
      .spyOn(Message.prototype as any, "toObject")
      .mockReturnValue({ text: "hello", _id: "mocked-id" });

    const result = await chatService.saveMessage(
      "aaaaaaaaaaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbbbbbbbbbb",
      "hello",
    );

    expect(mockSave).toHaveBeenCalled();
    expect(mockToObject).toHaveBeenCalled();
    expect(result).toMatchObject({ text: "hello", _id: "mocked-id" });
  });

  test("getMessagesBetween returns messages and total", async () => {
    const fakeMessages = [{ text: "hi" }, { text: "hey" }];

    // build chained mocks: find().sort().skip().limit().lean()
    const leanMock = jest.fn().mockResolvedValue(fakeMessages);
    const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
    const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
    const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
    const findMock = jest.fn().mockReturnValue({ sort: sortMock });

    // @ts-ignore assign mocks to model statics
    (Message.find as unknown) = findMock;
    (Message.countDocuments as unknown) = jest.fn().mockResolvedValue(2);

    const res = await chatService.getMessagesBetween("a", "b", 1, 50);

    expect(res.messages).toEqual(fakeMessages);
    expect(res.total).toBe(2);
  });
});
