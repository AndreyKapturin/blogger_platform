export class InputCreatePostDto {
  constructor(
    public title: string,
    public content: string,
    public shortDescription: string,
    public blogId: string,
  ) {}
}
