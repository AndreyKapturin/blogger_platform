export class InputUpdatePostDto {
  constructor(
    public title: string,
    public content: string,
    public shortDescription: string,
    public blogId: string,
  ) {}
}
