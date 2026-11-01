IF DB_ID(N'DigitalMarketingTraining') IS NULL
BEGIN
  CREATE DATABASE DigitalMarketingTraining;
END;
GO

USE DigitalMarketingTraining;
GO

IF OBJECT_ID(N'dbo.TrainingRegistrations', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.TrainingRegistrations (
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TrainingRegistrations PRIMARY KEY,
    Name NVARCHAR(120) NOT NULL,
    Business NVARCHAR(160) NOT NULL,
    LearningTopic NVARCHAR(120) NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_TrainingRegistrations_CreatedAt DEFAULT SYSUTCDATETIME()
  );
END;
GO
