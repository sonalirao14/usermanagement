export class UserRequest {
    constructor(
      public firstname: string,
      public lastname: string,
      public course:string,
      public email: string,
      public age: number
    ) {}
  
    static builder() {
      return new UserRequestBuilder();
    }
  }
  
  class UserRequestBuilder {
    private firstname: string = '';
    private lastname: string='';
    private course: string='';
    private email: string = '';

    private age: number = 0;
  
    withName(firstname: string): UserRequestBuilder {
      this.firstname = firstname;
      return this;
    }
  
   withLastName(lastname:string): UserRequestBuilder{
    this.lastname=lastname;
    return this;
   }
  
   withcourse(course:string): UserRequestBuilder{
    this.course=course;
    return this;
   }

    withEmail(email: string): UserRequestBuilder {
      this.email = email;
      return this;
    }
  
    withAge(age: number): UserRequestBuilder {
      this.age = age;
      return this;
    }
  
    build(): UserRequest {
      return new UserRequest(this.firstname,this.lastname,this.course, this.email, this.age);
    }
  }
  
  export class UserResponse {
    constructor(
      public id: string,
      public firstname: string,
      public lastname: string,
      public course: string,
      public email: string,
      public age: number
    ) {}
  }