# Help Me Cooking Backend API

A clean and modular Node.js Express backend for a cooking assistance app that provides recipe suggestions, step-by-step instructions, grocery lists, cooking tips, and YouTube video recommendations.

## 🚀 Features

- **Recipe Management**: Find recipes by ingredients, get detailed instructions
- **Smart Grocery Lists**: Generate shopping lists for single or multiple recipes
- **Cooking Tips**: Access categorized cooking advice and tips
- **YouTube Integration**: Search for cooking videos and tutorials
- **Clean Architecture**: MVC pattern with service layers
- **Error Handling**: Comprehensive error handling and validation
- **No Database Required**: Uses in-memory data and static JSON files

## 📁 Project Structure

```
/help-me-cooking-backend
├── routes/                 # API route definitions
│   ├── index.js           # Main router with API documentation
│   ├── recipes.js         # Recipe-related routes
│   ├── groceryList.js     # Grocery list routes
│   ├── cookingTips.js     # Cooking tips routes
│   └── youtube.js         # YouTube video search routes
├── controllers/           # Request handlers
│   ├── recipeController.js
│   ├── groceryController.js
│   ├── cookingTipsController.js
│   └── youtubeController.js
├── services/             # Business logic layer
│   ├── recipeService.js
│   ├── groceryService.js
│   ├── cookingTipsService.js
│   └── youtubeService.js
├── utils/                # Utility functions
│   ├── errorHandler.js   # Error handling utilities
│   ├── logger.js         # Logging utility
│   └── validators.js     # Input validation functions
├── data/                 # Static data files
│   ├── recipes.json      # Recipe database
│   ├── cookingTips.json  # Cooking tips database
│   └── ingredients.json  # Ingredients database
├── middleware/           # Custom middleware
│   ├── errorMiddleware.js     # Global error handler
│   └── validationMiddleware.js # Request validation
├── .env                  # Environment variables
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Node.js dependencies
├── app.js               # Express app configuration
└── server.js            # Server entry point
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn
- YouTube Data API key (optional, for video features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd help-me-cooking-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your YouTube API key:
   ```
   PORT=3000
   NODE_ENV=development
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
No authentication required for this version.

## 🔗 API Endpoints

### 📝 Recipes

#### Get Recipes by Ingredients
```http
GET /api/recipes/by-ingredients?items=eggs,tomato,cheese&limit=10
```

**Query Parameters:**
- `items` (required): Comma-separated list of ingredients
- `limit` (optional): Maximum number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "ingredients": ["eggs", "tomato", "cheese"],
    "count": 3,
    "recipes": [...]
  },
  "message": "Found 3 recipes matching your ingredients"
}
```

#### Get Recipe Instructions
```http
GET /api/recipes/:id/instructions
```

#### Search Recipes
```http
GET /api/recipes/search?q=omelet
```

#### Get All Recipes
```http
GET /api/recipes?cuisine=american&difficulty=easy&limit=20
```

### 🛒 Grocery Lists

#### Generate Grocery List
```http
GET /api/grocery-list?recipeId=123&servings=4
```

#### Multiple Recipe Grocery List
```http
POST /api/grocery-list/multiple
Content-Type: application/json

{
  "recipeIds": [1, 2, 3],
  "servings": {
    "1": 2,
    "2": 4,
    "3": 1
  }
}
```

#### Categorized Grocery List
```http
GET /api/grocery-list/:recipeId/by-category
```

### 💡 Cooking Tips

#### Get All Tips
```http
GET /api/cooking-tips?category=knife-skills&limit=20
```

#### Get Random Tip
```http
GET /api/cooking-tips/random?category=safety
```

#### Search Tips
```http
GET /api/cooking-tips/search?q=knife
```

#### Get Tips by Category
```http
GET /api/cooking-tips/category/safety
```

### 🎥 YouTube Videos

#### Search Cooking Videos
```http
GET /api/youtube-videos?q=eggs+cheese+omelet&limit=10
```

#### Get Popular Videos
```http
GET /api/youtube-videos/popular?limit=20
```

#### Search by Recipe
```http
GET /api/youtube-videos/recipe/omelet
```

#### Search by Ingredients
```http
GET /api/youtube-videos/ingredients?items=eggs,cheese,tomato
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `YOUTUBE_API_KEY` | YouTube Data API key | - |

### Data Files

The application uses static JSON files for data:

- **recipes.json**: Contains recipe data with ingredients, instructions, and metadata
- **cookingTips.json**: Cooking tips organized by categories
- **ingredients.json**: Ingredient database with nutritional info and alternatives

## 🧪 Testing

Test the API endpoints using tools like:
- **Postman**: Import the API collection
- **curl**: Command line testing
- **Insomnia**: REST client

### Example curl commands:

```bash
# Get recipes by ingredients
curl "http://localhost:3000/api/recipes/by-ingredients?items=eggs,cheese"

# Get cooking tips
curl "http://localhost:3000/api/cooking-tips/random"

# Search YouTube videos
curl "http://localhost:3000/api/youtube-videos?q=omelet+recipe"
```

## 🚀 Deployment

### Production Setup

1. Set environment to production:
   ```bash
   export NODE_ENV=production
   ```

2. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "cooking-api"
   ```

3. Set up reverse proxy (nginx):
   ```nginx
   location /api {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📋 TODO / Future Enhancements

- [ ] Add user authentication and authorization
- [ ] Implement recipe rating and reviews
- [ ] Add nutrition information calculation
- [ ] Create meal planning features
- [ ] Add image upload for recipes
- [ ] Implement caching layer (Redis)
- [ ] Add API rate limiting
- [ ] Create automated tests
- [ ] Add database integration (MongoDB/PostgreSQL)
- [ ] Implement recipe sharing features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Happy Cooking! 👨‍🍳👩‍🍳**