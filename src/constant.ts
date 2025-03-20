export class DependencyKeys {
    public static readonly DatabaseAccess: string = "DatabaseAccess";
    public static readonly UserService: string = "UserService";
    public static readonly UserRepository: string = "UserRepository";
    public static readonly AppBuilder: string = "AppBuilder";
    public static readonly Routes: string = "Routes";
    public static readonly RedisClient: string = "RedisClient"
       public static readonly DBConfig: string= "DBConfig";
       public static readonly RedisConfig: string="RedisConfig";
  }
// export class DependencyKeys {
//   public static readonly DatabaseAccess = Symbol.for("DatabaseAccess");
//   public static readonly UserService = Symbol.for("UserService");
//   public static readonly UserRepository = Symbol.for("UserRepository");
//   public static readonly AppBuilder = Symbol.for("AppBuilder");
//   public static readonly Routes = Symbol.for("Routes");
//   public static readonly RedisClient = Symbol.for("RedisClient");
//   public static readonly DBConfig = Symbol.for('DBConfig');
//   public static readonly RedisConfig=Symbol.for('RedisConfig');
// }
