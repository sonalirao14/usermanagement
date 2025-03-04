// export class UserRequest {
//     constructor(
//       public firstname: string,
//       public lastname: string,
//       public course:string,
//       public email: string,
//       public age: number
//     ) {}
  
//     static builder() {
//       return new UserRequestBuilder();
//     }
//   }
  
//   class UserRequestBuilder {
//     private firstname: string = '';
//     private lastname: string='';
//     private course: string='';
//     private email: string = '';

//     private age: number = 0;
  
//     withName(firstname: string): UserRequestBuilder {
  //     this.firstname = firstname;
  //     return this;
  //   }
  
  //  withLastName(lastname:string): UserRequestBuilder{
  //   this.lastname=lastname;
  //   return this;
  //  }
  
  //  withcourse(course:string): UserRequestBuilder{
  //   this.course=course;
  //   return this;
  //  }

  //   withEmail(email: string): UserRequestBuilder {
  //     this.email = email;
  //     return this;
  //   }
  
  //   withAge(age: number): UserRequestBuilder {
  //     this.age = age;
  //     return this;
  //   }
  
  //   build(): UserRequest {
  //     return new UserRequest(this.firstname,this.lastname,this.course, this.email, this.age);
  //   }
  // }
  
// export class UserResponse {
//     constructor(
//       public id: string,
//       public firstname: string,
//       public lastname: string,
//       public course: string,
//       public email: string,
//       public age: number
//     ) {}
//   }
import { Document as MongoDocument, ObjectId } from 'mongodb';
export class UserRequest implements MongoDocument {
  _id?:ObjectId;
  constructor(
    public firstname: string,
    public lastname: string,
    public course: string,
    public email: string,
    public age: number
  ) {}

  public static fromJson(json: any): UserRequest {
    if (!json || !json.firstname || !json.email || json.age === undefined || typeof json.age !== 'number') {
      throw new ValidationError('Invalid user data: name, email, and age are required, and age must be a number');
    }
    return new UserRequest(json.firstname,json.lastname,json.course, json.email, json.age);
  }
}

export class UserResponse implements MongoDocument {
  _id?:ObjectId
  constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    public course: string,
    public email: string,
    public age: number
  ) {}
}

// Custom error classes for extensive error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }

  status: number;
}

export class DatabaseError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
    this.details = details;
  }

  status: number;
  // public details?: any; // Make it optional (?) and explicitly public to match constructor
}

export class NotFoundError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.details = details;
  }

  status: number;
}

export class DuplicateKeyError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'DuplicateKeyError';
    this.status = 409; 
    this.details = details;
  }

  status: number;
}