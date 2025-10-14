-- 创建数据库（若已存在可跳过）
CREATE DATABASE IF NOT EXISTS poem_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE poem_db;

-- 创建表
CREATE TABLE IF NOT EXISTS poem (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  dynasty VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  appreciation TEXT NULL,
  favorite TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化示例数据（安全起见先删除同名数据）
DELETE FROM poem WHERE title IN ('静夜思','春晓','相思');

INSERT INTO poem (title, author, dynasty, content, appreciation, favorite) VALUES
('静夜思','李白','唐','床前明月光，疑是地上霜。举头望明月，低头思故乡。',NULL,0),
('春晓','孟浩然','唐','春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',NULL,0),
('相思','王维','唐','红豆生南国，春来发几枝。愿君多采撷，此物最相思。',NULL,0);